import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '标题是必需的'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '描述是必需的'],
    trim: true,
    maxlength: [500, '描述不能超过500个字符']
  },
  url: {
    type: String,
    required: [true, 'URL是必需的'],
    trim: true,
    match: [/^https?:\/\//, 'URL格式不正确']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  favoritesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 更新时自动更新updatedAt字段
toolSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Tool = mongoose.models.Tool || mongoose.model('Tool', toolSchema);

export default Tool;