A Guide to the Voice AI Stack
Ishi Singhal
Ishi Singhal

Follow
4 min read
·
Dec 30, 2025
27


2





Press enter or click to view image in full size

Voice AI has seen dramatic changes in the last couple of years — we went from Siri and Alexa to agents delivering actual economic value. There have been instances where AI has been successfully solving more than 95% of customer support queries, acting as testaments to the great potential this technology holds. In order to understand it better, it is important to first understand the layers that go into a voice AI system. This article maps that landscape, right from voice model provider ElevenLabs to application layers built on top.

Press enter or click to view image in full size

Source — Bessemer Venture Partners
How AI Listens
Let us start from the beginning. When you talk to an AI chatbot, it first converts whatever you say to text since it is more easily processable than data in the form of audio. This step is called Speech-to-Text (STT) or Automatic Speech Recognition (ASR). These models need to have high accuracy even in the presence of noisy signals, accents, etc. In order to provide a seamless experience, they also need to have very low latency.

OpenAI Whisper, Deepgram, AWS Transcribe, etc are amongst the well known ASRs. Whisper is open source and trained on 680,000 hours of multilingual audio and interestingly, about a third of this data is non-English.

Next comes the LLM that actually processes this text and generates a response. This could be any of GPT, Gemini, Claude, etc.

Enable Human Voice for AI
Once the response has been generated, it needs to be communicated to the user through voice, the job of the Text-to-Speech (TTS) layer. Here, the most important factor is how natural the speech sounds. It needs to feel like a human is on the other side of the conversation, which of course brings latency into the picture too.

Write on Medium
ElevenLabs has been, for long, the default TTS for many. However, emerging players like Cartesia have been challenging this position. Check out the link below to read more about their model and architecture.

What comes after Transformers: The $100M bet on SSMs
Amid the explosion of voice AI startups today, Cartesia stands out — having raised $100M, they are redefining what a…
medium.com

There also exist other players like PlayHT, Google, OpenAI, etc.

An Alternate Approach
While the three layers of STT, LLM and TTS have traditionally been used, there also exist end-to-end models like Gemini Flash Native Audio. This means that instead of converting the data to text, it would process the audio itself. These models, while looking attractive due to low latency, have not yet reached scalability. Cascading (STT, LLM and TTS) provides you with better cost control, tooling and customisations.


Runtime Layer
Now when you’re deploying a voice model, you have STT, LLM, TTS, telephony (the infrastructure that allows you to actually make those phone calls), external tool calls, memory, and other layers that you have to stitch together. This is not a trivial task — imagine a human conversation, when we interrupt, it should first get detected, the TTS stream has to be paused, STT needs to be resumed, and this text needs to be processed keeping the context in mind. This is where tools like Vapi, Retell AI, Voiceflow, etc come in. They do all these integrations and ensure that everything happens with very low latency.

Press enter or click to view image in full size

Vapi has completed more than 150M calls, enabling the adoption of voice AI
Developers can also pick and choose the runtime layer they want to adopt depending on the level of control they would like to have. Below is a quick read on different players in this space and what they offer.

Understanding Voice AI Development Paradigms
The landscape of Voice AI development is diverse, offering various approaches depending on the level of control and…
medium.com

Next comes the layer that allows users to design, customise and control the voice AI agent. Voiceflow helps teams visually design conversational flow, LangChain can provide toolings like RAG, Zapier can enable the agent to trigger workflows, etc.

Creating Economic Value
Finally, at the top of the stack sits the application layer. Today, a lot of these tools are built specifically for a function or an industry. Consider the case of an AI receptionist at a hospital that needs to identify emergencies, comply with numerous regulations and also show human emotion. Such nuances are difficult to capture in a generic voice bot. Abridge, having raised $300M for medical conversation intelligence, being an instance of this hypothesis.

On the other hand, platforms like SoundHound which are industry agnostic and offer agents for multiple functions propose something closer to general purpose AI.

With the rapid pace of innovation, it won’t be long before we start seeing voice AI in many applications beyond customer service. As architectures and models become increasingly capable, it will enable more horizontal players to emerge and get deployed across functions and industries. Most importantly, it will become the de facto way of humans conversing with machines — soon there might come a future when the keyboard, mouse and screen become obsolete — and players like ElevenLabs, Vapi, Abridge, etc are leading this transformation.