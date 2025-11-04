import sys
import dot2tex as d2t

def main():
    # Read LaTeX input from stdin or file (for simplicity, let's use stdin)
    latex_input = sys.stdin.read()
    
    # Process the input through dot2tex
    try:
        output = d2t.dot2tex(latex_input, format='tikz')
        print(output)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()