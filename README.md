SULLY SCRIBE
============

[Vercel Demo Link](https://sully-scribe.vercel.app)

STORIES
------

[x] interpret between the clinician (English-speaking) and the patient (Spanish-speaking), using speech input and output
[x] support special inputs such as the patient saying "repeat that", which should repeat the doctor's previous sentence.
[x] At the end of the conversation, provide a summary of the conversation along with these actions if detected during the conversation: schedule followup appointment, send lab order.
[x] Add and use tools to execute the actions (use https://webhook.site/ to simulate calling an action)
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

As such, it was important to me to make these work.

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
Then I am redirected to a VisitSummary page
And the visit is summarized 
And the visit is analyzed for key actions, e.g. "send_labs"

In implementing "realtime translation", I spent the majority of my time working with the Realtime API over WebRTC. I hadn't worked with it before, so it really took a large chunk of time to understand. While it was relatively quick to setup, I had a difficult time getting good results, and thus spent a lot of time trying to figure out ways to get better results.

For the post-visit summary, I used a quite basic prompt to analyze the entirety of the conversation and apply labels. If I had more time, I would prompt for metadata as well, preferably higlighting and jumping to parts in the conversation that led to the label -- e.g. "send_labs".

### Proof of Concept

NOTE: This is a relatively broken product. =P

[Demo](https://sully-scribe.vercel.app/)

### Technical Design

I don't think the rushed implentations of next.js, redux, or supabase are representative of ability, but here's why I chose each.

Next.js: kind of the best full-featured platform, for front-end but also quick API endpoints with logs
redux-toolkit: redux is great for handling state across many components, though I'm not really convinced this demo application needed it
supabase: in reality, the data isn't higly relational so a NoSQL database might be speedier. in reality, i wanted to (and it's generally easier to) integrate supabase. speed in building out demos was more important. supabase also makes data easy to see and manipulate in-browser.

Development
-----------

https://webhook.site/da3a130d-21d3-4bdd-b723-3c0fb145f8d7

## Supabase Setup

This project is configured to use Supabase for database functionality. To set up Supabase:

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in the Supabase dashboard
3. Get your project URL and anon key from the API settings
4. Add these credentials to your `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. When ready to integrate, import the Supabase client from `src/lib/supabase.ts`

Note: The Supabase client is currently set up but not integrated with the application.
