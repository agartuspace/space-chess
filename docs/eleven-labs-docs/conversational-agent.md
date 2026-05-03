***

title: Quickstart
subtitle: Build your first conversational agent in as little as 5 minutes.
--------------------------------------------------------------------------

In this guide, you'll learn how to create your first conversational agent. This will serve as a foundation for building conversational workflows tailored to your business use cases.

<Tip>
  Use the [ElevenLabs agents skill](https://github.com/elevenlabs/skills/tree/main/agents) to build and manage voice agents from your AI coding assistant:

  ```bash
  npx skills add elevenlabs/skills --skill agents
  ```
</Tip>

## Getting started

ElevenLabs Agents are managed either through the [ElevenAgents dashboard](https://elevenlabs.io/app/agents), the [ElevenLabs API](/docs/api-reference/introduction) or the [Agents CLI](/docs/eleven-agents/operate/cli).

<Frame caption="The assistant at the bottom right corner of this page is an example of an ElevenLabs agent, capable of answering questions about ElevenLabs, navigating pages & taking you to external resources." background="subtle">
  ![ElevenLabs Agents](file:abf606ac-d388-4800-a585-f5bd04e0bd86)
</Frame>

## Creating your first agent

In this quickstart guide we'll start by creating an agent via the API or the web dashboard. Next we'll test the agent, either by embedding it in your website or via the ElevenLabs dashboard.

<Tabs>
  <Tab title="Build an agent via the web dashboard">
    In this guide, we'll create a conversational support assistant capable of answering questions about your product, documentation, or service. This assistant can be embedded into your website or app to provide real-time support to your customers.

    <Frame caption="The assistant at the bottom right corner of this page is capable of answering questions about ElevenLabs, navigating pages & taking you to external resources." background="subtle">
      ![ElevenLabs Agents](file:abf606ac-d388-4800-a585-f5bd04e0bd86)
    </Frame>

    <Steps>
      <Step title="Sign in to ElevenLabs">
        Go to [elevenlabs.io](https://elevenlabs.io/app/sign-up) and sign in to or create your account.
      </Step>

      <Step title="Create a new assistant">
        In the **ElevenLabs Dashboard**, create a new assistant by entering a name and selecting the `Blank template` option.

        <Frame caption="Creating a new assistant" background="subtle">
          ![Dashboard](file:2aa99849-bc32-4e55-a132-3dfe66c16f6b)
        </Frame>
      </Step>

      <Step title="Configure the assistant behavior">
        Go to the **Agent** tab to configure the assistant's behavior. Set the following:

        <Steps>
          <Step title="First message">
            This is the first message the assistant will speak out loud when a user starts a conversation.

            ```plaintext First message
            Hi, this is Alexis from <company name> support. How can I help you today?
            ```
          </Step>

          <Step title="System prompt">
            This prompt guides the assistant's behavior, tasks, and personality.

            Customize the following example with your company details:

            ```plaintext System prompt
            You are a friendly and efficient virtual assistant for [Your Company Name]. Your role is to assist customers by answering questions about the company's products, services, and documentation. You should use the provided knowledge base to offer accurate and helpful responses.

            Tasks:
            - Answer Questions: Provide clear and concise answers based on the available information.
            - Clarify Unclear Requests: Politely ask for more details if the customer's question is not clear.

            Guidelines:
            - Maintain a friendly and professional tone throughout the conversation.
            - Be patient and attentive to the customer's needs.
            - If unsure about any information, politely ask the customer to repeat or clarify.
            - Avoid discussing topics unrelated to the company's products or services.
            - Aim to provide concise answers. Limit responses to a couple of sentences and let the user guide you on where to provide more detail.
            ```
          </Step>
        </Steps>
      </Step>

      <Step title="Add a knowledge base">
        Go to the **Knowledge Base** section to provide your assistant with context about your business.

        This is where you can upload relevant documents & links to external resources:

        * Include documentation, FAQs, and other resources to help the assistant respond to customer inquiries.
        * Keep the knowledge base up-to-date to ensure the assistant provides accurate and current information.
      </Step>
    </Steps>

    Next we'll configure the voice for your assistant.

    <Steps>
      <Step title="Select a voice">
        In the **Voice** tab, choose a voice that best matches your assistant from the [voice library](https://elevenlabs.io/voice-library):

        <Frame background="subtle">
          ![Voice settings](file:843629ab-6eaf-4590-bfb2-9586ce0d7507)
        </Frame>

        <Note>
           Using higher quality voices, models, and LLMs may increase response time. For an optimal customer experience, balance quality and latency based on your assistant's expected use case.
        </Note>
      </Step>

      <Step title="Testing your assistant">
        Press the **Test AI agent** button and try conversing with your assistant.
      </Step>
    </Steps>

    Configure evaluation criteria and data collection to analyze conversations and improve your assistant's performance.

    <Steps>
      <Step title="Configure evaluation criteria">
        Navigate to the **Analysis** tab in your assistant's settings to define custom criteria for evaluating conversations.

        <Frame background="subtle">
          ![Analysis settings](file:7ff73900-5bb5-436b-80eb-68f6fba7ae58)
        </Frame>

        Every conversation transcript is passed to the LLM to verify if specific goals were met. Results will either be `success`, `failure`, or `unknown`, along with a rationale explaining the chosen result.

        Let's add an evaluation criteria with the name `solved_user_inquiry`:

        ```plaintext Prompt
        The assistant was able to answer all of the queries or redirect them to a relevant support channel.

        Success Criteria:
        - All user queries were answered satisfactorily.
        - The user was redirected to a relevant support channel if needed.
        ```
      </Step>

      <Step title="Configure data collection">
        In the **Data Collection** section, configure details to be extracted from each conversation.

        Click **Add item** and configure the following:

        1. **Data type:** Select "string"
        2. **Identifier:** Enter a unique identifier for this data point: `user_question`
        3. **Description:** Provide detailed instructions for the LLM about how to extract the specific data from the transcript:

        ```plaintext Prompt
        Extract the user's questions & inquiries from the conversation.
        ```

        <Tip>
          Test your assistant by posing as a customer. Ask questions, evaluate its responses, and tweak the prompts until you're happy with how it performs.
        </Tip>
      </Step>

      <Step title="View conversation history">
        View evaluation results and collected data for each conversation in the **Call history** tab.

        <Frame background="subtle">
          ![Conversation history](file:b7380204-f983-44d9-8258-e381e7a67c91)
        </Frame>

        <Tip>
          Regularly review conversation history to identify common issues and patterns.
        </Tip>
      </Step>
    </Steps>

    The newly created agent can be tested in a variety of ways, but the quickest way is to use the [ElevenLabs dashboard](https://elevenlabs.io/app/agents).

    <Info>
      The web dashboard uses our [React SDK](/docs/eleven-agents/libraries/react) under the hood to handle real-time conversations.
    </Info>

    If instead you want to quickly test the agent in your own website, you can use the Agent widget. Simply paste the following HTML snippet into your website, taking care to replace `agent-id` with the ID of your agent.

    ```html
    <elevenlabs-convai agent-id="agent-id"></elevenlabs-convai>
    <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
    ```
  </Tab>

  <Tab title="Build an agent via the CLI">
    <Steps>
      <Step title="Install the CLI">
        ```bash
        npm install -g @elevenlabs/cli
        ```
      </Step>

      <Step title="Initialize a new project">
        ```bash
        elevenlabs agents init
        ```

        This creates the project structure with configuration directories and registry files.
      </Step>

      <Step title="Authenticate with ElevenLabs">
        [Create an API key in the dashboard here](https://elevenlabs.io/app/settings/api-keys), which you'll use to securely [use the CLI](/docs/api-reference/authentication).

        Then run the following command to authenticate with ElevenLabs:

        ```bash
        elevenlabs auth login
        ```

        Enter your ElevenLabs API key when prompted. The CLI will verify the key and store it securely.
      </Step>

      <Step title="Create the agent">
        Create your first agent using the assistant template:

        ```bash
        elevenlabs agents add "My Assistant" --template assistant
        ```
      </Step>

      <Step title="Push to ElevenLabs platform">
        ```bash
        elevenlabs agents push --agent "My Assistant"
        ```

        This uploads your local agent configuration to the ElevenLabs platform.
      </Step>

      <Step title="Test the agent">
        The newly created agent can be tested in a variety of ways, but the quickest way is to use the [ElevenLabs dashboard](https://elevenlabs.io/app/agents). From the dashboard, select your agent and click the **Test AI agent** button.

        <Info>
          The web dashboard uses our [React SDK](/docs/eleven-agents/libraries/react) under the hood to handle real-time conversations.
        </Info>

        If instead you want to quickly test the agent in your own website, you can use the Agent widget. Use the CLI to generate the HTML snippet:

        ```bash
        elevenlabs agents widget "My Assistant"
        ```

        This will output the HTML snippet you can then paste directly into your website.
      </Step>
    </Steps>
  </Tab>

  <Tab title="Build an agent via the API">
    <Steps>
      <Step title="Create an API key">
        [Create an API key in the dashboard here](https://elevenlabs.io/app/settings/api-keys), which you’ll use to securely [access the API](/docs/api-reference/authentication).

        Store the key as a managed secret and pass it to the SDKs either as a environment variable via an `.env` file, or directly in your app’s configuration depending on your preference.

        ```js title=".env"
        ELEVENLABS_API_KEY=<your_api_key_here>
        ```
      </Step>

      <Step title="Install the SDK">
        We'll also use the `dotenv` library to load our API key from an environment variable.

        <CodeBlocks>
          ```python
          pip install elevenlabs
          pip install python-dotenv
          ```

          ```typescript
          npm install @elevenlabs/elevenlabs-js
          npm install dotenv
          ```
        </CodeBlocks>
      </Step>

      <Step title="Create the agent">
        Create a new file named `create_agent.py` or `createAgent.mts`, depending on your language of choice and add the following code:

        <CodeBlocks>
          ```python maxLines=0
          from dotenv import load_dotenv
          from elevenlabs.client import ElevenLabs
          import os
          load_dotenv()

          elevenlabs = ElevenLabs(
              api_key=os.getenv("ELEVENLABS_API_KEY"),
          )

          prompt = """
          You are a friendly and efficient virtual assistant for [Your Company Name].
          Your role is to assist customers by answering questions about the company's products, services,
          and documentation. You should use the provided knowledge base to offer accurate and helpful responses.

          Tasks:
          - Answer Questions: Provide clear and concise answers based on the available information.
          - Clarify Unclear Requests: Politely ask for more details if the customer's question is not clear.

          Guidelines:
          - Maintain a friendly and professional tone throughout the conversation.
          - Be patient and attentive to the customer's needs.
          - If unsure about any information, politely ask the customer to repeat or clarify.
          - Avoid discussing topics unrelated to the company's products or services.
          - Aim to provide concise answers. Limit responses to a couple of sentences and let the user guide you on where to provide more detail.
          """

          response = elevenlabs.conversational_ai.agents.create(
              name="My voice agent",
              tags=["test"], # List of tags to help classify and filter the agent
              conversation_config={
                  "tts": {
                      "voice_id": "aMSt68OGf4xUZAnLpTU8",
                      "model_id": "eleven_flash_v2"
                  },
                  "agent": {
                      "first_message": "Hi, this is Rachel from [Your Company Name] support. How can I help you today?",
                      "prompt": {
                          "prompt": prompt,
                      }
                  }
              }
          )

          print("Agent created with ID:", response.agent_id)
          ```

          ```typescript maxLines=0
          import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
          import "dotenv/config";

          const elevenlabs = new ElevenLabsClient();

          const prompt = `
              You are a friendly and efficient virtual assistant for [Your Company Name].
              Your role is to assist customers by answering questions about the company's products, services,
              and documentation. You should use the provided knowledge base to offer accurate and helpful responses.

              Tasks:
              - Answer Questions: Provide clear and concise answers based on the available information.
              - Clarify Unclear Requests: Politely ask for more details if the customer's question is not clear.

              Guidelines:
              - Maintain a friendly and professional tone throughout the conversation.
              - Be patient and attentive to the customer's needs.
              - If unsure about any information, politely ask the customer to repeat or clarify.
              - Avoid discussing topics unrelated to the company's products or services.
              - Aim to provide concise answers. Limit responses to a couple of sentences and let the user guide you on where to provide more detail.
          `;

          const agent = await elevenlabs.conversationalAi.agents.create({
              name: "My voice agent",
              tags: ["test"], // List of tags to help classify and filter the agent
              conversationConfig: {
                  tts: {
                      voiceId: "aMSt68OGf4xUZAnLpTU8",
                      modelId: "eleven_flash_v2",
                  },
                  agent: {
                      firstMessage: "Hi, this is Rachel from [Your Company Name] support. How can I help you today?",
                      prompt: {
                          prompt,
                      }
                  },
              },
          });

          console.log(`Agent created with ID: ${agent.agentId}`);
          ```
        </CodeBlocks>

        <Note>
          The agent created above will have a `"test"` tag, this is useful to help classify and filter the agent. For example distinguishing between test agents and production agents.
        </Note>
      </Step>

      <Step title="Run the code">
        <CodeBlocks>
          ```python
          python create_agent.py
          ```

          ```typescript
          npx tsx createAgent.mts
          ```
        </CodeBlocks>

        The above will generate an agent with some baseline settings and print the ID of the agent to the console. We'll customize the agent in a subsequent step.
      </Step>

      <Step title="Test the agent">
        The newly created agent can be tested in a variety of ways, but the quickest way is to use the [ElevenLabs dashboard](https://elevenlabs.io/app/agents). From the dashboard, select your agent and click the **Test AI agent** button.

        <Info>
          The web dashboard uses our [React SDK](/docs/eleven-agents/libraries/react) under the hood to handle real-time conversations.
        </Info>

        If instead you want to quickly test the agent in your own website, you can use the Agent widget. Simply paste the following HTML snippet into your website, taking care to replace `agent-id` with the ID of your agent.

        ```html
        <elevenlabs-convai agent-id="agent-id"></elevenlabs-convai>
        <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
        ```

        View the SDKs tab to learn how to embed the agent in your website or app using the provided SDKs.
      </Step>
    </Steps>
  </Tab>
</Tabs>

## Next steps

As a follow up to this quickstart guide, you can make your agent more effective by integrating:

* [Knowledge bases](/docs/eleven-agents/customization/knowledge-base) to equip it with domain-specific information.
* [Tools](/docs/eleven-agents/customization/tools) to allow it to perform tasks on your behalf.
* [Authentication](/docs/eleven-agents/customization/authentication) to restrict access to certain conversations.
* [Success evaluation](/docs/eleven-agents/customization/agent-analysis/success-evaluation) to analyze conversations and improve its performance.
* [Data collection](/docs/eleven-agents/customization/agent-analysis/data-collection) to collect data about conversations and improve its performance.
* [Conversation retention](/docs/eleven-agents/customization/privacy/retention) to view conversation history and improve its performance.
