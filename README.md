SULLY SCRIBE
============

STORES
------

[ ] interpret between the clinician (English-speaking) and the patient (Spanish-speaking), using speech input and output
[ ] support special inputs such as the patient saying “repeat that”, which should repeat the doctor’s previous sentence.
[ ] At the end of the conversation, provide a summary of the conversation along with these actions if detected during the conversation: schedule followup appointment, send lab order.
[ ] Add and use tools to execute the actions (use https://webhook.site/ to simulate calling an action)
[ ] Store the full conversation and the summary in a database


Deliverables:
-------------

1. Document the list of features you chose to build and why: provide product rationale
2. Proof-of-concept: A functional prototype that enables communication between English and Spanish
    - A feature complete UI
    - Text-to-speech output for each utterance
    - Display both sides of the conversation in English
    - Display summary of the conversation
    - Store the conversation and the summary in a database
    - Display recognized intents/actions (listed above under Goals) along with their metadata
    - Execute actions using tools (use https://webhook.site/)
3. Technical Design Doc that captures your thought process

DEV
---

Scenario: Doctor can record/stop a session
As a doctor
When I click record
I can record a session
And when I click stop
I can end recording of a session

--------

https://webhook.site/da3a130d-21d3-4bdd-b723-3c0fb145f8d7
