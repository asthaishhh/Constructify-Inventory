import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Company slug is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    companyTagline: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    gstIn: {
      type: String,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'companies',
    timestamps: true,
  }
);

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

export default Company;
