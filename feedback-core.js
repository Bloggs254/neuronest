export function prepareFeedback(fields) {
  const understanding = String(fields.understanding ?? '').trim();
  const unclear = String(fields.unclear ?? '').trim();
  const interest = String(fields.interest ?? '');
  if (understanding.length < 5 || understanding.length > 400) throw new Error('Tell us what you think NeuroNest does in 5–400 characters.');
  if (unclear.length > 600) throw new Error('Keep your suggestions within 600 characters.');
  if (!['Yes', 'Not sure', 'No'].includes(interest)) throw new Error('Choose whether you would consider contacting us.');
  const text = `NeuroNest website feedback\n\nWhat I think you do:\n${understanding}\n\nUnclear or missing:\n${unclear || 'Nothing noted'}\n\nWould I consider contacting NeuroNest? ${interest}`;
  return { text, href: 'mailto:neuronest@gmail.com?subject=' + encodeURIComponent('NeuroNest website feedback') + '&body=' + encodeURIComponent(text) };
}
