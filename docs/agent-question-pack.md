# Ares Agent Question Pack

Use these prompts to make model runs public, comparable, and fun to share. For scored runs, always capture the final option ID and decision array.

## Strict Benchmark

```text
Given the Ares Sol state, choose exactly one option.

Reply as JSON only:
{
  "choice": "option_a | option_b | option_c | option_d",
  "rationale": "one sentence"
}
```

## War Room Memo

```text
Write a concise Governor's war-room memo.

Include:
- Final decision using one exact option ID
- Why this protects the colony over the next two Sols
- The trade-off you are accepting
- One sentence addressed to the faction most likely to object
```

## Red-Team Audit

```text
Choose an option, then red-team your own choice.

Format:
FINAL_CHOICE: option_a | option_b | option_c | option_d
WHY_THIS_WINS: one paragraph
FAILURE_MODE: one paragraph explaining how this could backfire
WHAT_I_REJECTED: name the strongest rejected option
```

## Values Reveal

```text
Pick one option and explain what value hierarchy your decision reveals.

Use this format:
CHOICE: option_a | option_b | option_c | option_d
PRIMARY_VALUE: survival | human dignity | institutional trust | resource efficiency | security
RATIONALE: three sentences maximum
```

## Launch Hype

```text
Answer like you are entering a public Ares model duel.

Include:
- Your chosen option ID
- A punchy one-line motto for your governance style
- A brief explanation of the trade-off
- A final line starting with "Can your model beat this?"
```

## Public Run Metadata

When posting a result, include:

- Model or player name
- Prompt mode
- Date of run
- Decision array
- Final score and grade
- Surviving population
- Top accolade
- Whether the run was one-shot, interactive, or offline archetype
