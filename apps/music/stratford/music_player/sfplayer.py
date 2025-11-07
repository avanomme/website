#!/usr/bin/env python3
import subprocess
import tkinter as tk
from tkinter import filedialog, messagebox
import os

class FluidSynthGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🎹 SoundFont Player")
        self.sf2_path = ""
        self.midi_path = ""
        self.proc = None

        # SF2 selection
        tk.Label(root, text="SoundFont (.sf2):").grid(row=0, column=0, sticky="e", padx=5, pady=5)
        self.sf2_entry = tk.Entry(root, width=50)
        self.sf2_entry.grid(row=0, column=1, padx=5, pady=5)
        tk.Button(root, text="Browse", command=self.select_sf2).grid(row=0, column=2, padx=5)

        # MIDI selection
        tk.Label(root, text="MIDI File (.mid):").grid(row=1, column=0, sticky="e", padx=5, pady=5)
        self.midi_entry = tk.Entry(root, width=50)
        self.midi_entry.grid(row=1, column=1, padx=5, pady=5)
        tk.Button(root, text="Browse", command=self.select_midi).grid(row=1, column=2, padx=5)

        # Control buttons
        tk.Button(root, text="▶ Play", command=self.play).grid(row=2, column=1, pady=15, sticky="e")
        tk.Button(root, text="⏹ Stop", command=self.stop).grid(row=2, column=2, pady=15, sticky="w")

    def select_sf2(self):
        path = filedialog.askopenfilename(title="Select SoundFont", filetypes=[("SoundFont files", "*.sf2")])
        if path:
            self.sf2_path = path
            self.sf2_entry.delete(0, tk.END)
            self.sf2_entry.insert(0, path)

    def select_midi(self):
        path = filedialog.askopenfilename(title="Select MIDI File", filetypes=[("MIDI files", "*.mid")])
        if path:
            self.midi_path = path
            self.midi_entry.delete(0, tk.END)
            self.midi_entry.insert(0, path)

    def play(self):
        sf2 = self.sf2_entry.get().strip()
        midi = self.midi_entry.get().strip()

        if not sf2 or not os.path.exists(sf2):
            messagebox.showerror("Error", "Please select a valid SoundFont (.sf2).")
            return
        if not midi or not os.path.exists(midi):
            messagebox.showerror("Error", "Please select a valid MIDI file (.mid).")
            return

        # Stop previous instance if running
        self.stop()

        try:
            cmd = [
                "fluidsynth",
                "-a", "coreaudio",
                sf2,
                midi
            ]
            self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            messagebox.showinfo("Playing", "🎶 FluidSynth is now playing the MIDI with your SoundFont!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start FluidSynth:\n{e}")

    def stop(self):
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            self.proc = None

if __name__ == "__main__":
    root = tk.Tk()
    app = FluidSynthGUI(root)
    root.mainloop()
