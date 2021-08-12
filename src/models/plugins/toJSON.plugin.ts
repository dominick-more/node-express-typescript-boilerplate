import { Document, Model, Schema } from 'mongoose';

/* eslint-disable no-param-reassign */

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteAtPath = (obj: Record<string, any> | undefined, path: string[], index: number): void => {
  if (obj === undefined || index < 0 || index >= path.length) {
    return;
  }
  const selectedPath = path[index];
  if (index === path.length - 1) {
    delete obj[selectedPath];
  } else {
    const subObj = obj[selectedPath];
    if (typeof subObj === 'object' && subObj !== null) {
      deleteAtPath(subObj, path, index + 1);
    }
  }
};

const toJSON = <DocType = Document, SchemaDefinitionType = undefined>(
  schema: Schema<DocType, Model<DocType>, SchemaDefinitionType>
): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anySchema = schema as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
  const transform: (_model: Model<DocType>, _ret: Document<any, Record<string, never>, DocType>) => void | undefined =
    typeof anySchema.options?.toJSON?.transform === 'function' ? anySchema.options.toJSON.transform : undefined;

  anySchema.options.toJSON = Object.assign(anySchema.options?.toJSON || {}, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform(model: Model<DocType>, ret: Document<any, Record<string, never>, DocType>): void {
      Object.keys(schema.paths).forEach((path) => {
        if (anySchema.paths[path]?.options?.private) {
          deleteAtPath(ret, path.split('.'), 0);
        }
      });

      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (ret as any).createdAt;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (ret as any).updatedAt;
      if (transform) {
        return transform(model, ret);
      }
    },
  });
};

export default toJSON;
