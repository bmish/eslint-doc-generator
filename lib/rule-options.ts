import type { JSONSchema } from '@typescript-eslint/utils';

/**
 * Gather a list of named options from a rule schema.
 * @param jsonSchema - the JSON schema to check
 * @returns - list of named options we could detect from the schema
 */
export function getAllNamedOptions(
  jsonSchema: JSONSchema.JSONSchema4
): readonly string[] {
  if (!jsonSchema) {
    return [];
  }

  if (Array.isArray(jsonSchema)) {
    return jsonSchema.flatMap((js: JSONSchema.JSONSchema4) =>
      getAllNamedOptions(js)
    );
  }

  if (jsonSchema.items) {
    return getAllNamedOptions(jsonSchema.items);
  }

  if (jsonSchema.properties) {
    return Object.keys(jsonSchema.properties);
  }

  return [];
}

/**
 * Check if a rule schema is non-blank/empty and thus has actual options.
 * @param jsonSchema - the JSON schema to check
 * @returns - whether the schema has options
 */
export function hasOptions(jsonSchema: JSONSchema.JSONSchema4): boolean {
  return (
    (Array.isArray(jsonSchema) && jsonSchema.length > 0) ||
    (typeof jsonSchema === 'object' && Object.keys(jsonSchema).length > 0)
  );
}
