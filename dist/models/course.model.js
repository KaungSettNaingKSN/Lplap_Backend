"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    user: Object,
    rating: {
        type: Number,
        default: 0,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    commentReplies: [Object],
}, { timestamps: true });
const linkSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, { _id: false });
const commentSchema = new mongoose_1.Schema({
    user: Object,
    question: String,
    questionReplies: [Object],
}, { timestamps: true });
const courseDataSchema = new mongoose_1.Schema({
    videoUrl: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    videoSection: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videoLength: {
        type: Number,
        required: true,
    },
    videoPlayer: {
        type: String,
    },
    links: [linkSchema],
    suggestion: {
        type: String,
        required: true,
    },
    questions: [commentSchema],
}, { timestamps: true });
const courseSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter course name"],
    },
    description: {
        type: String,
        required: [true, "Please enter course description"],
    },
    price: {
        type: Number,
        required: [true, "Please enter course price"],
    },
    estimatedPrice: {
        type: Number,
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    // optional tags
    tags: {
        type: String,
        default: "",
    },
    // main category
    category: {
        type: String,
        required: [true, "Please select course category"],
    },
    level: {
        type: String,
        required: [true, "Please enter course level"],
    },
    demoUrl: {
        type: String,
        required: [true, "Please enter course demo url"],
    },
    benefits: [
        {
            title: {
                type: String,
                required: true,
            },
        },
    ],
    prerequisites: [
        {
            title: {
                type: String,
                required: true,
            },
        },
    ],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchased: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
const courseModel = mongoose_1.default.model("Course", courseSchema);
exports.default = courseModel;
