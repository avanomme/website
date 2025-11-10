from dfa_regex_converter import regex_to_min_dfa, dfa_to_regex_string

def handle_regex_to_dfa(pattern: str):
    dfa = regex_to_min_dfa(pattern)
    return {
        "alphabet": sorted(list(dfa.alphabet)),
        "start": dfa.start,
        "accepts": sorted(list(dfa.accepts)),
        "transitions": dfa.transitions,
    }