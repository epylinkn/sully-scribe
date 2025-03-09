SULLY SCRIBE
============

STORIES
------

[ ] interpret between the clinician (English-speaking) and the patient (Spanish-speaking), using speech input and output
[ ] support special inputs such as the patient saying “repeat that”, which should repeat the doctor’s previous sentence.
[x] At the end of the conversation, provide a summary of the conversation along with these actions if detected during the conversation: schedule followup appointment, send lab order.
[ ] Add and use tools to execute the actions (use https://webhook.site/ to simulate calling an action)
[x] Store the full conversation and the summary in a database


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

Thoughts
--------

### Product Rationale

This is a BIG project with lots of dependencies and requirements!!!

For me, if we think of this as a "hackathon demo", there are two wow features:
1. Realtime translation between a patient and clincian, in text and audio
2. Post-visit summary and insights, with metadata

As such, it was important to me to make these work, but I still didn't quite get there. ;)

The full happy path being:
As a Clinician,
When I press "Record",
Then I start a new visit with a patient,
When I say "the patient will be speaking in Spanish",
Then the demo will set the Clinicians language to English and the patients language to Spanish,
When I ask the patient: "How are you doing today?"
Then the demo will show both "How are you doing today?" and "cómo está hoy"
And the demo will speak "cómo está hoy"
When the patient responds: "Estoy muy bien"
Then the demo will show both "Estoy muy bien" and "I'm doing great"
And the demo will speak "I'm doing great"
When I press "End Visit"
Then the visit is summarized and analyzed for "send_labs"
Then I am redirected to a VisitSummary page

In implementing "realtime translation", I spent the majority of my time working with the Realtime API over WebRTC. I hadn't worked with it before, so it really took a large chunk of time to understand. While it was relatively quick to setup, I had a difficult time getting good results, and thus spent a lot of time trying to figure out ways to get better results.

At first, I started with a large monoprompt that attempted to identify the languages spoken AND do the live translation, given tools to identify languages and write messages to the database. This quickly proved unworkable, as I was unable to get it to just simply recognize the language I was speaking in -- e.g. english, spanish, vietnamese.

In theory, a well-engineered monoprompt would work given more time, but I chose to pivot towards a more structured conversation with two milestones: (1) set the languages and (2) translate between those languages. I found this pattern more useful in my previous work of conversation traversal and way easier to test. My translation results improved slightly... though the model still struggled differentiating my English and my Spanish. :(

For the post-visit summary, I used a quite basic prompt to analyze the entirety of the conversation and apply labels. If I had more time, I would prompt for metadata as well, preferably higlighting and jumping to parts in the conversation that led to the label -- e.g. "send_labs".

### Proof of Concept

NOTE: This is a relatively broken product as I didn't bother to isolate visits in the database or implement a full solution to start new visits and sessions. To save time, I used Google's Firestore (NoSQL database), which allows me to easily nuke all the data.

[Demo](https://sully-scribe.vercel.app/)

### Technical Design

Technically, I didn't finish the happy path I laid out for myself. I did eventually figure out how to structure the conversation and update the model's instructions and available tools once the langauges were set. This let me develop the translation assistant without needing to constantly regression test that agent can set languages.

I don't think the rushed implentations of next.js, redux, or firestore are representative of ability, but here's why I chose each.

Next.js: kind of the best full-featured platform, for front-end but also quick API endpoints with logs
firestore: great at chat applications and quickly building out demos. Data is easy to see and manipulate, as well as delete in Google's in-browser navigator.
redux-toolkit: redux is great for handling state across many components, though I'm not really convinced this demo application needed it



Development
-----------

https://webhook.site/da3a130d-21d3-4bdd-b723-3c0fb145f8d7
