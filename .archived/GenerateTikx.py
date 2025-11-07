import tkinter as tk
from tkinter import ttk
from tkinter import filedialog
import subprocess
import os

def generate_dot():
    # Get inputs from the user
    alph = alph_entry.get()
    nodes = int(nodes_entry.get())
    initial = initial_entry.get()
    dead = dead_entry.get()
    final = final_entry.get()

    # Parse the inputs
    alph_array = alph.split()
    nodes_array = [str(i) for i in range(nodes + 1)]
    initial_node = initial.strip()
    final_nodes_array = final.split()

    # Replace the dead node number with 'd'
    if dead.strip():
        dead_node = dead.strip()
        nodes_array[int(dead_node)] = 'd'

    # Initialize the transitions dictionary
    transitions = {}
    for node in nodes_array:
        transitions[node] = {}
    for node in transitions:
        for alphs in alph_array:
            transitions[node][alphs] = transition_entries[node][alphs].get()

    # Initialize the DOT graph description
    dot_graph = f"""
digraph DFA {{
    rankdir=LR; 
    node [shape = circle]; 

    {initial_node} [label="{initial_node}"];
"""

    # Add nodes to the graph, skipping the initial node
    for node in nodes_array:
        if node != initial_node:
            if node in final_nodes_array:
                dot_graph += f'    {node} [label="{node}", shape=doublecircle];\n'
            else:
                dot_graph += f'    {node} [label="{node}"];\n'

    # Add transitions to the graph
    for node in transitions:
        for alphs in transitions[node]:
            target_node = transitions[node][alphs]
            dot_graph += f'    {node} -> {target_node} [label="{alphs}"];\n'

    dot_graph += "}\n"

    return dot_graph

def generate_tikz():
    dot_graph = generate_dot()

    # Save the DOT graph to a temporary file
    with open("temp.dot", "w") as file:
        file.write(dot_graph)

    # Call dot2tex to convert the DOT file to TikZ
    try:
        result = subprocess.run(["dot2tex", "--autosize", "temp.dot"], capture_output=True, text=True)
        tikz_graph = result.stdout
    except FileNotFoundError:
        tikz_graph = "dot2tex is not installed or not found in PATH."

    # Display the TikZ graph description
    output_text.delete(1.0, tk.END)
    output_text.insert(tk.END, tikz_graph)

    # Clean up the temporary file
    os.remove("temp.dot")

def create_transition_table():
    global transition_entries
    transition_entries = {}
    alph_array = alph_entry.get().split()
    nodes = int(nodes_entry.get())
    nodes_array = [str(i) for i in range(nodes + 1)]

    # Replace the dead node number with 'd'
    dead = dead_entry.get().strip()
    if dead:
        dead_node = int(dead)
        nodes_array[dead_node] = 'd'

    # Clear the transition frame
    for widget in transition_frame.winfo_children():
        widget.destroy()

    # Create the header row
    tk.Label(transition_frame, text="").grid(row=0, column=0)
    for j, alph in enumerate(alph_array):
        tk.Label(transition_frame, text=alph).grid(row=0, column=j+1)

    # Create the transition table
    for i, node in enumerate(nodes_array):
        transition_entries[node] = {}
        tk.Label(transition_frame, text=node).grid(row=i+1, column=0)
        for j, alph in enumerate(alph_array):
            entry = tk.Entry(transition_frame)
            entry.grid(row=i+1, column=j+1)
            transition_entries[node][alph] = entry

def save_tikz():
    tikz_graph = output_text.get(1.0, tk.END)
    file_path = filedialog.asksaveasfilename(defaultextension=".tex", filetypes=[("TeX files", "*.tex"), ("All files", "*.*")])
    if file_path:
        with open(file_path, "w") as file:
            file.write(tikz_graph)

# Create the main window
root = tk.Tk()
root.title("Build TikZ Script DFA")

# Create and place the input fields
tk.Label(root, text="Alphabet (separate with space):").grid(row=0, column=0, sticky=tk.W)
alph_entry = tk.Entry(root)
alph_entry.grid(row=0, column=1)

tk.Label(root, text="Number of nodes:").grid(row=1, column=0, sticky=tk.W)
nodes_entry = tk.Entry(root)
nodes_entry.grid(row=1, column=1)

tk.Label(root, text="Initial node:").grid(row=2, column=0, sticky=tk.W)
initial_entry = tk.Entry(root)
initial_entry.grid(row=2, column=1)

tk.Label(root, text="Dead node (if any, otherwise leave blank):").grid(row=3, column=0, sticky=tk.W)
dead_entry = tk.Entry(root)
dead_entry.grid(row=3, column=1)

tk.Label(root, text="Final nodes (separate with space):").grid(row=4, column=0, sticky=tk.W)
final_entry = tk.Entry(root)
final_entry.grid(row=4, column=1)

# Create and place the buttons
enter_button = tk.Button(root, text="Enter", command=create_transition_table)
enter_button.grid(row=5, column=0, columnspan=2)

# Create a frame for the transition table
transition_frame = tk.Frame(root)
transition_frame.grid(row=6, column=0, columnspan=2)

# Create and place the output text box
output_text = tk.Text(root, height=10, width=50)
output_text.grid(row=7, column=0, columnspan=2)

# Create and place the done button
done_button = tk.Button(root, text="Done", command=generate_tikz)
done_button.grid(row=8, column=0, columnspan=2)

# Create and place the save button
save_button = tk.Button(root, text="Save", command=save_tikz)
save_button.grid(row=9, column=0, columnspan=2)

# Start the main event loop
root.mainloop()