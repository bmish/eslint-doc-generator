import traverse from 'json-schema-traverse';
import type { JSONSchema } from '@typescript-eslint/utils';
import { capitalizeOnlyFirstLetter } from './string.js';

export type RuleOption = {
  name: string;
  type?: string;
  description?: string;
  required?: boolean;
  enum?: readonly JSONSchema.JSONSchema4Type[];
  default?: JSONSchema.JSONSchema4Type;
  deprecated?: boolean;
};

function typeToString(
  type: JSONSchema.JSONSchema4TypeName[] | JSONSchema.JSONSchema4TypeName
): string {
  return Array.isArray(type)
    ? type.map((item) => capitalizeOnlyFirstLetter(item)).join(', ')
    : capitalizeOnlyFirstLetter(type);
}

/**
 * Gather a list of named options from a rule schema.
 * @param jsonSchema - the JSON schema to check
 * @returns - list of named options we could detect from the schema
 */
export function getAllNamedOptions(
  jsonSchema:
    | JSONSchema.JSONSchema4
    | readonly JSONSchema.JSONSchema4[]
    | undefined
    | null
): readonly RuleOption[] {
  if (!jsonSchema) {
    return [];
  }

  if (Array.isArray(jsonSchema)) {
    return jsonSchema.flatMap((js: JSONSchema.JSONSchema4) =>
      getAllNamedOptions(js)
    );
  }

  const options: RuleOption[] = [];
  traverse(jsonSchema, (js: JSONSchema.JSONSchema4) => {
    if (js.properties) {
      options.push(
        ...Object.entries(js.properties).map(([key, value]) => ({
          name: key,
          type:
            value.type === 'array' &&
            !Array.isArray(value.items) &&
            value.items?.type
              ? `${
                  Array.isArray(value.items.type) && value.items.type.length > 1
                    ? `(${typeToString(value.items.type)})`
                    : typeToString(value.items.type)
                }[]`
              : value.type
              ? typeToString(value.type)
              : undefined,
          description: value.description,
          default: value.default,
          enum: value.enum,
          required:
            typeof value.required === 'boolean'
              ? value.required
              : Array.isArray(js.required) && js.required.includes(key),
          deprecated: value.deprecated, // eslint-disable-line @typescript-eslint/no-unsafe-assignment -- property exists on future JSONSchema version but we can let it be used anyway.
        }))
      );
    }
  });
  return options;
}

/**
 * Check if a rule schema is non-blank/empty and thus has actual options.
 * @param jsonSchema - the JSON schema to check
 * @returns - whether the schema has options
 */
export function hasOptions(
  jsonSchema: JSONSchema.JSONSchema4 | readonly JSONSchema.JSONSchema4[]
): boolean {
  return (
    (Array.isArray(jsonSchema) && jsonSchema.length > 0) ||
    (typeof jsonSchema === 'object' && Object.keys(jsonSchema).length > 0)
  );
}
