/**
 * « Être rappelé » (R006-S02) : corps de `POST /submit-form`.
 *
 * Le serveur compose le sujet « Demande de rappel — <Robot> » avec `Type de demande` et
 * `Robot`, et la fiche du robot arrive dans `Lien de la fiche`. Sans robot choisi, ces deux
 * clés sont omises et le sujet garde son préfixe seul.
 */
export interface CallbackInput {
  name: string;
  phone: string;
  question: string;
  /** Robot rappelé, ou `null` pour un rappel sans robot précis. */
  robot: { name: string; ficheUrl: string } | null;
}

export function buildCallbackBody(
  input: CallbackInput,
): Record<string, string | boolean> {
  const body: Record<string, string | boolean> = {
    'Type de demande': 'Rappel',
  };
  if (input.robot) {
    body['Robot'] = input.robot.name;
    body['Lien de la fiche'] = input.robot.ficheUrl;
  }
  body['Nom'] = input.name.trim();
  body['Numéro de téléphone'] = input.phone.trim();
  if (input.question.trim()) body['Question'] = input.question.trim();
  body['Conditions acceptées'] = true;
  return body;
}
