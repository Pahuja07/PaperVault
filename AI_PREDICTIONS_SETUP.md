# AI Predictions Feature - Setup Guide

This guide will help you set up the AI-powered exam prediction feature for your PYP (Previous Year Papers) website.

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- OpenAI API key (get from https://platform.openai.com/api-keys)
- Existing PYP website backend and frontend

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
pnpm install
# or npm install
```

### 2. Configure OpenAI API Key

Update your `backend/.env` file:

```env
# Add this line with your actual OpenAI API key
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Update Database Schema

Run the database migration to add prediction tables:

```bash
cd backend
pnpm db:push
# or npm run db:push
```

This will create the following tables:
- `predictions` - Stores AI-generated predictions
- `question_bank` - Extracted questions from papers
- `topic_mastery` - Topic importance tracking
- `prediction_feedback` - User feedback on predictions

### 4. Install Frontend Dependencies

```bash
cd pyp-website/pyp-website
pnpm install
# or npm install
```

### 5. Start the Application

Terminal 1 - Backend:
```bash
cd backend
pnpm start
# or npm start
```

Terminal 2 - Frontend:
```bash
cd pyp-website/pyp-website
pnpm dev
# or npm run dev
```

## 🎯 How It Works

### AI Prediction Flow

1. **User Selection**: Student selects branch, department, and semester
2. **Data Retrieval**: System fetches relevant previous year papers
3. **AI Analysis**: OpenAI GPT-4 analyzes patterns and generates predictions
4. **Results Display**: Shows important topics, predicted questions, and visualizations
5. **Feedback Collection**: Students can rate prediction helpfulness

### Key Features

✅ **Smart Topic Analysis** - Identifies most important topics with confidence scores
✅ **Question Prediction** - Generates likely exam questions with marks distribution
✅ **Visual Analytics** - Charts showing topic importance and marks distribution
✅ **Branch Filtering** - Supports SKIT branches with common subjects for 1st/2nd sem
✅ **User Feedback** - Students can rate predictions to improve accuracy
✅ **Study Recommendations** - AI-generated study tips based on analysis

## 📁 File Structure

### Backend Files Created

```
backend/
├── src/
│   ├── models/
│   │   └── prediction.model.js          # Database schema for predictions
│   ├── controllers/
│   │   └── ai.controller.js             # AI prediction logic
│   ├── routes/
│   │   └── ai.routes.js                 # AI API endpoints
│   └── services/
│       └── pdf.service.js               # PDF text extraction
├── .env                                  # Updated with OPENAI_API_KEY
├── index.js                              # Updated to include AI routes
└── package.json                          # Added openai and pdf-parse
```

### Frontend Files Created

```
pyp-website/pyp-website/
├── src/
│   ├── pages/
│   │   └── AIPredictions/
│   │       └── AIPredictions.jsx        # Main predictions page
│   ├── components/
│   │   └── Navbar/
│   │       └── Navbar.jsx               # Updated with AI Predictions link
│   └── App.jsx                           # Added /predictions route
└── package.json                          # Added recharts
```

## 🔌 API Endpoints

### Get Predictions for Subject
```
GET /ai/predictions?subjectid={id}&departmentid={id}&semester={1-8}
```

### Get Predictions by Department
```
GET /ai/predictions/department/:departmentid/semester/:semester
```

### Get Common Subject Predictions (1st/2nd Sem)
```
GET /ai/predictions/common/semester/:semester
```

### Rate Prediction Helpfulness
```
POST /ai/predictions/:predictionid/rate
Body: { isHelpful: boolean, rating: 1-5, comment?: string }
```

### Get Topic Analysis
```
GET /ai/topic-analysis?subjectid={id}&departmentid={id}
```

### Get SKIT Info
```
GET /ai/skit-info
```

## 🎨 Frontend Features

### AI Predictions Page (`/predictions`)

- **Filter Panel**: Select branch, department, and semester
- **Loading State**: Animated AI processing indicator
- **Prediction Summary**: Overall confidence score with visual bar
- **Important Topics**: Grid of cards showing top topics with confidence
- **Predicted Questions**: List of likely questions with rating system
- **Charts**: 
  - Bar chart for marks distribution by unit
  - Pie chart for topic confidence levels
- **Study Recommendations**: AI-generated study tips
- **Disclaimer**: Important notice about AI predictions

### Navigation

- New "AI Predictions" link in navbar with Brain icon
- Accessible from both desktop and mobile menus
- Active state highlighting when on predictions page

## 🗄️ Database Schema

### Predictions Table
```sql
- predictionid (UUID, PK)
- subjectid, departmentid (FK)
- semester, year
- importantTopics (JSON)
- predictedQuestions (JSON)
- topicFrequency (JSON)
- marksDistribution (JSON)
- confidenceScore (Decimal)
- basedOnPapers (Integer)
- modelVersion (String)
- views, helpfulVotes, notHelpfulVotes
- isActive, isVerified (Boolean)
- createdat, updatedat (Timestamp)
```

### Question Bank Table
```sql
- questionid (UUID, PK)
- paperid (FK)
- questionText (Text)
- marks (Integer)
- questionType (String)
- topics, keywords (Array)
- unit, difficulty (String)
- year, semester (Integer)
- subjectid, departmentid (FK)
- createdat (Timestamp)
```

## 🔧 Configuration

### OpenAI Model Configuration

The system uses GPT-4 Turbo for predictions. You can modify the model in `backend/src/controllers/ai.controller.js`:

```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview', // Change model here
  messages: [...],
  temperature: 0.7, // Adjust creativity (0-1)
  max_tokens: 2000,
  response_format: { type: 'json_object' }
})
```

### SKIT Branches & Common Subjects

Update `backend/src/controllers/ai.controller.js` to customize:

```javascript
export const skitCommonSubjects = [
  // Add/remove common subjects here
]

export const skitBranches = [
  // Add/remove branches here
]
```

## 🧪 Testing

### Test AI Predictions

1. Start both backend and frontend
2. Navigate to `/predictions`
3. Select a department and semester
4. Wait for AI to generate predictions
5. Review topics, questions, and charts
6. Rate predictions to provide feedback

### Test Common Subjects

1. Select "Common Subjects (1st/2nd Sem)" as branch
2. Choose semester 1 or 2
3. View predictions for all common subjects

## 🐛 Troubleshooting

### OpenAI API Errors

**Error**: "Invalid API key"
- **Solution**: Verify your API key in `.env` file
- Check OpenAI account has available credits

**Error**: "Rate limit exceeded"
- **Solution**: Wait a few minutes or upgrade OpenAI plan
- Consider caching predictions to reduce API calls

### Database Errors

**Error**: "relation does not exist"
- **Solution**: Run `pnpm db:push` to create tables

**Error**: "connection refused"
- **Solution**: Ensure PostgreSQL is running on correct port

### Frontend Errors

**Error**: "Failed to fetch"
- **Solution**: Verify backend is running on port 8000
- Check `VITE_API_URL` in frontend `.env`

**Error**: "recharts is not defined"
- **Solution**: Run `pnpm install` in frontend directory

## 📊 Performance Optimization

### Caching Strategy

Predictions are cached in the database to:
- Reduce OpenAI API costs
- Improve response time
- Provide instant results for repeated queries

### Batch Processing

For large numbers of papers, consider:
- Processing papers in batches
- Using background jobs for PDF extraction
- Implementing a queue system

## 💰 Cost Estimation

### OpenAI API Costs (Approximate)

- **GPT-4 Turbo**: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- **Average prediction**: ~500 input tokens, ~1000 output tokens
- **Cost per prediction**: ~$0.035

### Cost Reduction Tips

1. **Cache predictions** - Generate once, serve many times
2. **Use fewer papers** - Limit to 5-10 most recent papers
3. **Optimize prompts** - Reduce token count in prompts
4. **Schedule generation** - Generate during off-peak hours

## 🔒 Security Considerations

1. **API Key Protection**
   - Never commit `.env` files
   - Use environment variables for sensitive data
   - Rotate API keys regularly

2. **Rate Limiting**
   - Implement rate limiting on prediction endpoints
   - Prevent abuse of OpenAI API

3. **User Authentication**
   - Require login for rating predictions
   - Prevent spam feedback

4. **Input Validation**
   - Validate all user inputs
   - Sanitize data before database insertion

## 📈 Future Enhancements

### Planned Features

1. **PDF Text Extraction**
   - Extract questions directly from uploaded PDFs
   - Build comprehensive question bank
   - Improve prediction accuracy

2. **Machine Learning Models**
   - Train custom ML models on historical data
   - Reduce dependency on OpenAI API
   - Improve prediction accuracy over time

3. **Advanced Analytics**
   - Trend analysis over multiple years
   - Subject difficulty progression
   - Peer comparison metrics

4. **Personalized Recommendations**
   - Track user performance
   - Suggest topics based on weak areas
   - Create study plans

5. **Faculty Verification**
   - Allow professors to verify predictions
   - Add credibility indicators
   - Expert review system

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review error logs in backend console
3. Verify database connections
4. Test API endpoints with Postman

## 📝 Notes

- Predictions are AI-generated and should be used as study aids, not guarantees
- Always refer to official syllabus and consult faculty
- System improves with more uploaded papers
- Common subjects work best for first-year students

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-25  
**Maintained by**: Development Team