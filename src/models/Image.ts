import mongoose from 'mongoose';

interface IImage {
  data: Buffer;
  meta: {
    uploaded: Date;
    type: {
      mime?: string;
      ext?: string;
    };
  };
  key?: string;
};

const imageSchema = new mongoose.Schema(
  {
    data: {
      type: Buffer,
      required: true
    },
    meta: {
      uploaded: {
        type: Date,
        default: Date.now,
        required: true
      },
      type: {
        mime: {
          type: String
        },
        ext: {
          type: String
        }
      }
    },
    key: {
      type: String,
      required: false
    }
  },
  {
    collection: 'images'
  }
);

export default mongoose.model<IImage>('Image', imageSchema);