export function buildPrompt(todos) {
  const list = todos.map((t) => `${t.id}: ${t.text}`).join('\n');
  return `You are a task organizer. Reorder the following todo items so that related items are placed adjacent to each other. Group similar topics, projects, or contexts together.

Return ONLY a JSON object with a single key "sortedIds" containing an array of all the todo IDs in your preferred order. Do not include any explanation.

Todo items:
${list}

Respond with JSON only, e.g.: {"sortedIds":["id1","id2","id3"]}`;
}

export function parseAISortResponse(rawText) {
  // Strip code fences (```json ... ``` or ``` ... ```)
  const stripped = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new Error(`AI response is not valid JSON: ${stripped}`);
  }

  if (!Object.prototype.hasOwnProperty.call(parsed, 'sortedIds')) {
    throw new Error('AI response missing "sortedIds" field');
  }

  if (!Array.isArray(parsed.sortedIds)) {
    throw new Error('"sortedIds" must be an array');
  }

  return parsed.sortedIds;
}
