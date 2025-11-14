Inference
🐸TTS Command line
You can check all supported languages with the following command:

 tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
    --list_language_idx
You can check all Coqui available speakers with the following command:

 tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
    --list_speaker_idx
Coqui speakers
You can do inference using one of the available speakers using the following command:

 tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
     --text "It took me quite a long time to develop a voice, and now that I have it I'm not going to be silent." \
     --speaker_idx "Ana Florence" \
     --language_idx en \
     --use_cuda
Clone a voice
See also

Voice cloning

You can clone a speaker voice using a single or multiple references:

Single reference
 tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
     --text "Bugün okula gitmek istemiyorum." \
     --speaker_wav /path/to/target/speaker.wav \
     --language_idx tr \
     --use_cuda
Multiple references
 tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
     --text "Bugün okula gitmek istemiyorum." \
     --speaker_wav /path/to/target/speaker.wav /path/to/target/speaker_2.wav /path/to/target/speaker_3.wav \
     --language_idx tr \
     --use_cuda
or for all wav files in a directory you can use:

 tts --model_name tts_models/multilingual/multi-dataset/xtts_v2 \
     --text "Bugün okula gitmek istemiyorum." \
     --speaker_wav /path/to/target/*.wav \
     --language_idx tr \
     --use_cuda
🐸TTS API
Clone a voice
You can clone a speaker voice using a single or multiple references:

Single reference
Splits the text into sentences and generates audio for each sentence. The audio files are then concatenated to produce the final audio. You can optionally disable sentence splitting for better coherence but more VRAM and possibly hitting models context length limit.

from TTS.api import TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")

# generate speech by cloning a voice using default settings
tts.tts_to_file(text="It took me quite a long time to develop a voice, and now that I have it I'm not going to be silent.",
                file_path="output.wav",
                speaker_wav=["/path/to/target/speaker.wav"],
                language="en",
                split_sentences=True
                )
Multiple references
You can pass multiple audio files to the speaker_wav argument for better voice cloning.

from TTS.api import TTS

# using the default version set in 🐸TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")

# using a specific version
# 👀 see the branch names for versions on https://huggingface.co/coqui/XTTS-v2/tree/main
# ❗some versions might be incompatible with the API
tts = TTS("xtts_v2.0.2").to("cuda")

# getting the latest XTTS_v2
tts = TTS("xtts").to("cuda")

# generate speech by cloning a voice using default settings
tts.tts_to_file(text="It took me quite a long time to develop a voice, and now that I have it I'm not going to be silent.",
                file_path="output.wav",
                speaker_wav=["/path/to/target/speaker.wav", "/path/to/target/speaker_2.wav", "/path/to/target/speaker_3.wav"],
                language="en")
Coqui speakers
You can do inference using one of the available speakers using the following code:

from TTS.api import TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")

# generate speech by cloning a voice using default settings
tts.tts_to_file(
  text="It took me quite a long time to develop a voice, and now that I have it I'm not going to be silent.",
  file_path="output.wav",
  speaker="Ana Florence",
  language="en",
  split_sentences=True
)
🐸TTS Model API
To use the model API, you need to download the model files and pass config and model file paths manually.

Manual Inference
If you want to be able to load_checkpoint with use_deepspeed=True and enjoy the speedup, you need to install deepspeed first.

pip install deepspeed
Inference parameters
text: The text to be synthesized.

language: The language of the text to be synthesized.

gpt_cond_latent: The latent vector you get with get_conditioning_latents. (You can cache for faster inference with same speaker)

speaker_embedding: The speaker embedding you get with get_conditioning_latents. (You can cache for faster inference with same speaker)

temperature: The softmax temperature of the autoregressive model. Defaults to 0.65.

length_penalty: A length penalty applied to the autoregressive decoder. Higher settings causes the model to produce more terse outputs. Defaults to 1.0.

repetition_penalty: A penalty that prevents the autoregressive decoder from repeating itself during decoding. Can be used to reduce the incidence of long silences or “uhhhhhhs”, etc. Defaults to 2.0.

top_k: Lower values mean the decoder produces more “likely” (aka boring) outputs. Defaults to 50.

top_p: Lower values mean the decoder produces more “likely” (aka boring) outputs. Defaults to 0.8.

speed: The speed rate of the generated audio. Defaults to 1.0. (can produce artifacts if far from 1.0)

enable_text_splitting: Whether to split the text into sentences and generate audio for each sentence. It allows you to have infinite input length but might loose important context between sentences. Defaults to False.

Inference
import os
import torch
import torchaudio
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts

print("Loading model...")
config = XttsConfig()
config.load_json("/path/to/xtts/config.json")
model = Xtts.init_from_config(config)
model.load_checkpoint(config, checkpoint_dir="/path/to/xtts/", use_deepspeed=True)
model.cuda()

print("Computing speaker latents...")
gpt_cond_latent, speaker_embedding = model.get_conditioning_latents(audio_path=["reference.wav"])

print("Inference...")
out = model.inference(
    "It took me quite a long time to develop a voice and now that I have it I am not going to be silent.",
    "en",
    gpt_cond_latent,
    speaker_embedding,
    temperature=0.7, # Add custom parameters here
)
torchaudio.save("xtts.wav", torch.tensor(out["wav"]).unsqueeze(0), 24000)
You can also use the Coqui speakers:

gpt_cond_latent, speaker_embedding = model.speaker_manager.speakers["Ana Florence"].values()
Streaming manually
Here the goal is to stream the audio as it is being generated. This is useful for real-time applications. Streaming inference is typically slower than regular inference, but it allows to get a first chunk of audio faster.

import os
import time
import torch
import torchaudio
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts

print("Loading model...")
config = XttsConfig()
config.load_json("/path/to/xtts/config.json")
model = Xtts.init_from_config(config)
model.load_checkpoint(config, checkpoint_dir="/path/to/xtts/", use_deepspeed=True)
model.cuda()

print("Computing speaker latents...")
gpt_cond_latent, speaker_embedding = model.get_conditioning_latents(audio_path=["reference.wav"])

print("Inference...")
t0 = time.time()
chunks = model.inference_stream(
    "It took me quite a long time to develop a voice and now that I have it I am not going to be silent.",
    "en",
    gpt_cond_latent,
    speaker_embedding
)

wav_chuncks = []
for i, chunk in enumerate(chunks):
    if i == 0:
        print(f"Time to first chunck: {time.time() - t0}")
    print(f"Received chunk {i} of audio length {chunk.shape[-1]}")
    wav_chuncks.append(chunk)
wav = torch.cat(wav_chuncks, dim=0)
torchaudio.save("xtts_streaming.wav", wav.squeeze().unsqueeze(0).cpu(), 24000)