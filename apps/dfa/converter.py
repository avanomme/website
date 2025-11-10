from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Set, Tuple, List, Optional, FrozenSet


# =========================
# Regex AST + Simplification
# =========================

class Regex:
    def __or__(self, other: 'Regex') -> 'Regex':
        return Union(self, other).simplify()

    def __add__(self, other: 'Regex') -> 'Regex':
        # Concatenation using +
        return Concat(self, other).simplify()

    def star(self) -> 'Regex':
        return Star(self).simplify()

    def is_empty(self) -> bool:
        return isinstance(self, EmptySet)

    def is_epsilon(self) -> bool:
        return isinstance(self, Epsilon)

    def precedence(self) -> int:
        raise NotImplementedError

    def to_str(self, parent_prec: int = 0) -> str:
        raise NotImplementedError

    def simplify(self) -> 'Regex':
        return self


@dataclass(frozen=True)
class EmptySet(Regex):
    def precedence(self) -> int:
        return 3

    def to_str(self, parent_prec: int = 0) -> str:
        return "∅"


@dataclass(frozen=True)
class Epsilon(Regex):
    def precedence(self) -> int:
        return 3

    def to_str(self, parent_prec: int = 0) -> str:
        return "ε"


@dataclass(frozen=True)
class Literal(Regex):
    symbol: str

    def precedence(self) -> int:
        return 3

    def to_str(self, parent_prec: int = 0) -> str:
        return self.symbol


@dataclass(frozen=True)
class Star(Regex):
    inner: Regex

    def precedence(self) -> int:
        return 2

    def simplify(self) -> Regex:
        inner = self.inner
        # (∅)* = ε, ε* = ε, (A*)* = A*
        if isinstance(inner, EmptySet) or isinstance(inner, Epsilon):
            return Epsilon()
        if isinstance(inner, Star):
            return inner
        return self

    def to_str(self, parent_prec: int = 0) -> str:
        s = self.inner.to_str(self.precedence())
        if self.inner.precedence() < self.precedence():
            s = f"({s})"
        return s + "*"


@dataclass(frozen=True)
class Concat(Regex):
    left: Regex
    right: Regex

    def precedence(self) -> int:
        return 1

    def simplify(self) -> Regex:
        # Flatten all concatenation factors
        factors: List[Regex] = []

        def collect(r: Regex):
            if isinstance(r, Concat):
                collect(r.left)
                collect(r.right)
            else:
                factors.append(r)

        collect(self)

        # If any factor is ∅, whole concat is ∅
        for f in factors:
            if isinstance(f, EmptySet):
                return EmptySet()

        # Remove ε factors (identity)
        factors = [f for f in factors if not isinstance(f, Epsilon)]

        if not factors:
            return Epsilon()

        # Rebuild chain left-associatively
        res: Regex = factors[0]
        for f in factors[1:]:
            res = Concat(res, f)
        return res

    def to_str(self, parent_prec: int = 0) -> str:
        parts: List[str] = []

        def collect(node: Regex):
            if isinstance(node, Concat):
                collect(node.left)
                collect(node.right)
            else:
                s = node.to_str(self.precedence())
                if node.precedence() < self.precedence():
                    s = f"({s})"
                parts.append(s)

        collect(self)
        s = "".join(parts)
        if self.precedence() < parent_prec:
            return f"({s})"
        return s


@dataclass(frozen=True)
class Union(Regex):
    left: Regex
    right: Regex

    def precedence(self) -> int:
        return 0

    def simplify(self) -> Regex:
        # Flatten all union terms
        terms: List[Regex] = []

        def collect(r: Regex):
            if isinstance(r, Union):
                collect(r.left)
                collect(r.right)
            else:
                terms.append(r)

        collect(self)

        # Remove ∅
        terms = [t for t in terms if not isinstance(t, EmptySet)]

        if not terms:
            return EmptySet()

        # Deduplicate structurally equal terms
        unique: List[Regex] = []
        for t in terms:
            if t not in unique:
                unique.append(t)

        if len(unique) == 1:
            return unique[0]

        res: Regex = unique[0]
        for t in unique[1:]:
            res = Union(res, t)
        return res

    def to_str(self, parent_prec: int = 0) -> str:
        parts: List[str] = []

        def collect(node: Regex):
            if isinstance(node, Union):
                collect(node.left)
                collect(node.right)
            else:
                s = node.to_str(self.precedence())
                if node.precedence() < self.precedence():
                    s = f"({s})"
                parts.append(s)

        collect(self)
        s = "|".join(parts)
        if self.precedence() < parent_prec:
            return f"({s})"
        return s


# ===============
# Regex -> AST
# ===============

def _add_concat_ops(pattern: str) -> str:
    """Insert explicit '.' for concatenation."""
    res: List[str] = []
    prev = ''
    for c in pattern:
        if prev:
            # implicit concat if:
            # prev is literal, ')', or '*' AND current is literal or '('
            if ((prev.isalnum() or prev in {')', '*'})
                    and (c.isalnum() or c == '(')):
                res.append('.')
        res.append(c)
        prev = c
    return "".join(res)


def _to_postfix(pattern: str) -> List[str]:
    """Shunting-yard to postfix: supports |, concatenation '.', and *."""
    precedence = {'*': 3, '.': 2, '|': 1}
    right_assoc = {'*'}  # star is postfix/unary
    output: List[str] = []
    stack: List[str] = []
    i = 0
    while i < len(pattern):
        c = pattern[i]
        if c.isalnum():
            output.append(c)
        elif c == '(':
            stack.append(c)
        elif c == ')':
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            if not stack:
                raise ValueError("Unmatched parenthesis")
            stack.pop()
        elif c in precedence:
            if c == '*':
                # Postfix operator; pop strictly higher precedence
                while stack and precedence.get(stack[-1], 0) > precedence[c]:
                    output.append(stack.pop())
                stack.append(c)
            else:
                while (stack and stack[-1] != '(' and
                       (precedence.get(stack[-1], 0) > precedence[c] or
                        (precedence.get(stack[-1], 0) == precedence[c] and c not in right_assoc))):
                    output.append(stack.pop())
                stack.append(c)
        else:
            raise ValueError(f"Unexpected character in regex: {c}")
        i += 1

    while stack:
        op = stack.pop()
        if op in '()':
            raise ValueError("Unmatched parenthesis at end")
        output.append(op)
    return output


def parse_regex(pattern: str) -> Regex:
    """Parse a regex string into a Regex AST."""
    pattern = pattern.replace(" ", "")
    pattern = _add_concat_ops(pattern)
    postfix = _to_postfix(pattern)
    stack: List[Regex] = []
    for token in postfix:
        if token.isalnum():
            stack.append(Literal(token))
        elif token == '*':
            if not stack:
                raise ValueError("Star with empty stack")
            a = stack.pop()
            stack.append(Star(a).simplify())
        elif token == '.':
            if len(stack) < 2:
                raise ValueError("Concat with <2 operands")
            b = stack.pop()
            a = stack.pop()
            stack.append(Concat(a, b).simplify())
        elif token == '|':
            if len(stack) < 2:
                raise ValueError("Union with <2 operands")
            b = stack.pop()
            a = stack.pop()
            stack.append(Union(a, b).simplify())
        else:
            raise ValueError("Bad token in postfix: " + token)
    if len(stack) != 1:
        raise ValueError("Invalid regex (stack size != 1)")
    return stack[0]


# =========
# NFA / DFA
# =========

class NFA:
    def __init__(self):
        self.start: int = 0
        self.accept: int = 0
        # transitions[state][symbol] -> set(next_states)
        # symbol == None => epsilon
        self.transitions: Dict[int, Dict[Optional[str], Set[int]]] = {}
        self._next_state = 0

    def new_state(self) -> int:
        s = self._next_state
        self._next_state += 1
        if s not in self.transitions:
            self.transitions[s] = {}
        return s

    def add_edge(self, src: int, sym: Optional[str], dst: int):
        if src not in self.transitions:
            self.transitions[src] = {}
        self.transitions[src].setdefault(sym, set()).add(dst)

    @staticmethod
    def from_regex(r: Regex) -> 'NFA':
        nfa = NFA()

        def build(node: Regex) -> Tuple[int, int]:
            if isinstance(node, EmptySet):
                s = nfa.new_state()
                f = nfa.new_state()
                return s, f
            if isinstance(node, Epsilon):
                s = nfa.new_state()
                f = nfa.new_state()
                nfa.add_edge(s, None, f)
                return s, f
            if isinstance(node, Literal):
                s = nfa.new_state()
                f = nfa.new_state()
                nfa.add_edge(s, node.symbol, f)
                return s, f
            if isinstance(node, Star):
                sub_s, sub_f = build(node.inner)
                s = nfa.new_state()
                f = nfa.new_state()
                nfa.add_edge(s, None, sub_s)
                nfa.add_edge(s, None, f)
                nfa.add_edge(sub_f, None, sub_s)
                nfa.add_edge(sub_f, None, f)
                return s, f
            if isinstance(node, Concat):
                s1, f1 = build(node.left)
                s2, f2 = build(node.right)
                nfa.add_edge(f1, None, s2)
                return s1, f2
            if isinstance(node, Union):
                s1, f1 = build(node.left)
                s2, f2 = build(node.right)
                s = nfa.new_state()
                f = nfa.new_state()
                nfa.add_edge(s, None, s1)
                nfa.add_edge(s, None, s2)
                nfa.add_edge(f1, None, f)
                nfa.add_edge(f2, None, f)
                return s, f
            raise TypeError("Unknown regex node")

        start, accept = build(r)
        nfa.start = start
        nfa.accept = accept
        return nfa


class DFA:
    def __init__(self):
        self.alphabet: Set[str] = set()
        self.start: int = 0
        self.accepts: Set[int] = set()
        self.transitions: Dict[int, Dict[str, int]] = {}

    @staticmethod
    def from_nfa(nfa: NFA) -> Tuple['DFA', Dict[FrozenSet[int], int]]:
        dfa = DFA()

        # Alphabet = all non-epsilon symbols
        for trans in nfa.transitions.values():
            for sym in trans.keys():
                if sym is not None:
                    dfa.alphabet.add(sym)

        from functools import lru_cache

        @lru_cache(maxsize=None)
        def eps_closure(state: int) -> FrozenSet[int]:
            stack = [state]
            closure = {state}
            while stack:
                s = stack.pop()
                for t in nfa.transitions.get(s, {}).get(None, []):
                    if t not in closure:
                        closure.add(t)
                        stack.append(t)
            return frozenset(closure)

        def eps_closure_set(states: Set[int]) -> FrozenSet[int]:
            res: Set[int] = set()
            for s in states:
                res |= set(eps_closure(s))
            return frozenset(res)

        start_set = eps_closure(nfa.start)
        state_map: Dict[FrozenSet[int], int] = {start_set: 0}
        dfa.start = 0
        if nfa.accept in start_set:
            dfa.accepts.add(0)
        unmarked: List[FrozenSet[int]] = [start_set]

        while unmarked:
            S = unmarked.pop()
            s_id = state_map[S]
            dfa.transitions.setdefault(s_id, {})
            for sym in dfa.alphabet:
                dest: Set[int] = set()
                for nstate in S:
                    for t in nfa.transitions.get(nstate, {}).get(sym, []):
                        dest.add(t)
                if not dest:
                    continue
                T = eps_closure_set(dest)
                if T not in state_map:
                    state_map[T] = len(state_map)
                    if nfa.accept in T:
                        dfa.accepts.add(state_map[T])
                    unmarked.append(T)
                dfa.transitions[s_id][sym] = state_map[T]
        return dfa, state_map


# =================
# DFA Minimization
# =================

def hopcroft_minimize(dfa: DFA) -> DFA:
    states = set(dfa.transitions.keys()) | dfa.accepts | {dfa.start}
    for s in list(states):
        dfa.transitions.setdefault(s, {})
    alphabet = set(dfa.alphabet)

    # Initial partition: accepting vs non-accepting
    F = set(dfa.accepts)
    NF = states - F
    P: List[Set[int]] = []
    if F:
        P.append(F)
    if NF:
        P.append(NF)
    W: List[Set[int]] = [F.copy()] if F else []

    while W:
        A = W.pop()
        for c in alphabet:
            X = {s for s in states if dfa.transitions.get(s, {}).get(c) in A}
            newP: List[Set[int]] = []
            for Y in P:
                inter = Y & X
                diff = Y - X
                if inter and diff:
                    newP.append(inter)
                    newP.append(diff)
                    if Y in W:
                        W.remove(Y)
                        W.append(inter)
                        W.append(diff)
                    else:
                        if len(inter) <= len(diff):
                            W.append(inter)
                        else:
                            W.append(diff)
                else:
                    newP.append(Y)
            P = newP

    # Build minimized DFA
    rep_map: Dict[int, int] = {}
    for i, block in enumerate(P):
        for s in block:
            rep_map[s] = i

    new_dfa = DFA()
    new_dfa.alphabet = alphabet

    for s in states:
        ns = rep_map[s]
        if s == dfa.start:
            new_dfa.start = ns
        if s in dfa.accepts:
            new_dfa.accepts.add(ns)
        new_dfa.transitions.setdefault(ns, {})
        for c, t in dfa.transitions.get(s, {}).items():
            new_dfa.transitions[ns][c] = rep_map[t]

    new_dfa.accepts = set(new_dfa.accepts)
    return new_dfa


# =================
# DFA -> Regex
# =================

def dfa_to_regex(dfa: DFA) -> Regex:
    """
    Convert DFA to regex using generalized NFA + state elimination.

    - Adds new start S' with ε to old start.
    - Adds new final F' with ε from each accepting state.
    - Eliminates all intermediate states using a heuristic that prefers
      states with few predecessors/successors (degree-based cost).
    """
    # Map states to 0..n-1
    states = sorted(set(dfa.transitions.keys()) | dfa.accepts | {dfa.start})
    index = {s: i for i, s in enumerate(states)}
    n = len(states)
    start_idx = index[dfa.start]
    accept_states = {index[s] for s in dfa.accepts}

    # Add new start and final
    S_ = n
    F_ = n + 1
    total = n + 2

    # Initialize regex matrix R[i][j]
    R: List[List[Regex]] = [[EmptySet() for _ in range(total)] for __ in range(total)]

    # Original transitions
    for s, trans in dfa.transitions.items():
        i = index[s]
        for sym, t in trans.items():
            j = index[t]
            lit = Literal(sym)
            R[i][j] = (R[i][j] | lit).simplify()

    # ε from new start to original start
    R[S_][start_idx] = (R[S_][start_idx] | Epsilon()).simplify()
    # ε from each accept to new final
    for a in accept_states:
        R[a][F_] = (R[a][F_] | Epsilon()).simplify()

    def preds(k: int, alive: Set[int]) -> List[int]:
        return [i for i in alive if not R[i][k].is_empty()]

    def succs(k: int, alive: Set[int]) -> List[int]:
        return [j for j in alive if not R[k][j].is_empty()]

    alive = set(range(total))
    alive.discard(S_)
    alive.discard(F_)

    # Eliminate states
    while alive:
        # Choose state with minimal indegree*outdegree to limit blow-up
        best_k = None
        best_cost = None
        full_alive = alive | {S_, F_}
        for k in list(alive):
            ps = preds(k, full_alive)
            ss = succs(k, full_alive)
            cost = len(ps) * len(ss)
            if best_cost is None or cost < best_cost:
                best_cost = cost
                best_k = k
        k = best_k  # type: ignore

        full_alive = alive | {S_, F_}
        ps = preds(k, full_alive)
        ss = succs(k, full_alive)
        loop = R[k][k]
        loop_star = loop.star() if not loop.is_empty() else Epsilon()

        for i in ps:
            for j in ss:
                # R[i][j] |= R[i][k] (R[k][k])* R[k][j]
                new_expr = (R[i][k] + loop_star + R[k][j]).simplify()
                R[i][j] = (R[i][j] | new_expr).simplify()

        # Remove state k
        for i in range(total):
            R[i][k] = EmptySet()
            R[k][i] = EmptySet()
        alive.remove(k)

    regex = R[S_][F_].simplify()
    return regex


def dfa_to_regex_string(dfa: DFA) -> str:
    return dfa_to_regex(dfa).to_str()


# =====================
# High-level helpers
# =====================

def regex_to_min_dfa(pattern: str) -> DFA:
    """Parse regex, build ε-NFA, determinize, and minimize."""
    ast = parse_regex(pattern)
    nfa = NFA.from_regex(ast)
    dfa, _ = DFA.from_nfa(nfa)
    return hopcroft_minimize(dfa)


def build_dfa_from_table(
    alphabet: List[str],
    start_state: int,
    accept_states: Set[int],
    transition_table: Dict[int, Dict[str, int]],
) -> DFA:
    d = DFA()
    d.alphabet = set(alphabet)
    d.start = start_state
    d.accepts = set(accept_states)
    d.transitions = {s: dict(trans) for s, trans in transition_table.items()}
    return d


# =====================
# Demo / Test
# =====================

if __name__ == "__main__":
    # Test case from the prompt: b*ab*(b*ab*ab*)*
    pattern = "b*ab*(b*ab*ab*)*"
    print("Original regex:", pattern)

    # Regex -> min DFA
    dfa_from_regex = regex_to_min_dfa(pattern)
    print("Min DFA from regex:")
    print("  start:", dfa_from_regex.start)
    print("  accepts:", dfa_from_regex.accepts)
    print("  transitions:", dfa_from_regex.transitions)

    # DFA defined by the given table:
    # |State|a|b|
    # |->0  |1|0|
    # |*1   |0|1|
    table_dfa = build_dfa_from_table(
        alphabet=["a", "b"],
        start_state=0,
        accept_states={1},
        transition_table={
            0: {"a": 1, "b": 0},
            1: {"a": 0, "b": 1},
        },
    )
    min_table_dfa = hopcroft_minimize(table_dfa)
    print("\nMin DFA from transition table:")
    print("  start:", min_table_dfa.start)
    print("  accepts:", min_table_dfa.accepts)
    print("  transitions:", min_table_dfa.transitions)

    # Convert both minimal DFAs back to regex
    regex_from_dfa1 = dfa_to_regex_string(dfa_from_regex)
    regex_from_dfa2 = dfa_to_regex_string(min_table_dfa)

    print("\nRegex from DFA (built from pattern):")
    print(" ", regex_from_dfa1)

    print("\nRegex from DFA (built from table):")
    print(" ", regex_from_dfa2)