# myLeetSpace

> **Stop grinding. Start learning.**

LeetSpace is a comprehensive coding interview preparation platform that transforms random practice into systematic improvement. Built by developers, for developers, it combines spaced repetition algorithms with active recall techniques to help you master coding problems efficiently.

##  Features

### **Smart Learning System**
- **Spaced Repetition**: Review concepts at optimal intervals for better retention
- **Active Recall**: Practice retrieving information instead of just re-reading
- **Mistake Learning**: Track and learn from errors to avoid repeating them

###  **Problem Management**
- **Version Control**: Track multiple solution attempts and learn from iterations
- **Tagging System**: Organize problems by difficulty, topic, and personal notes
- **Retry Later**: Mark problems for focused review sessions

### **Analytics & Insights**
- **Activity Heatmap**: Visualize your daily coding practice
- **Weakness Identification**: Identify areas that need more attention
- **Progress Tracking**: Monitor your improvement over time
- **Revision History**: See how your solutions evolve

### **User Experience**
- **Firebase Authentication**: Secure user management
- **Responsive Design**: Works seamlessly on all devices
- **Dark/Light Theme**: Customizable interface preferences
- **Demo Mode**: Try the platform without signing up

##  Architecture

### Frontend
- **React 19** with modern hooks and context
- **Tailwind CSS** for responsive, utility-first styling
- **Vite** for fast development and building
- **CodeMirror** for syntax highlighting and code editing
- **Radix UI** components for accessible design

### Backend
- **FastAPI** for high-performance Python web framework
- **MongoDB** with Motor async driver for data persistence
- **Firebase Admin SDK** for authentication
- **Pydantic** for data validation and serialization

### Key Technologies
- **Spaced Repetition Algorithm**: Custom implementation for optimal review scheduling
- **Real-time Updates**: Live dashboard updates and notifications
- **RESTful API**: Clean, documented endpoints for all operations

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB instance
- Firebase project with Admin SDK

### Frontend Setup
```bash
cd frontend/leetspace-frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the server
uvicorn main:app --reload
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGODB_URL=your_mongodb_connection_string
FIREBASE_CREDENTIALS_PATH=path_to_firebase_admin_sdk.json
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
ENABLE_DEBUG_ROUTES=false
```

## 📱 Usage

### 1. **Add Problems**
- Record your coding problem solutions
- Add personal notes and insights
- Tag problems by difficulty and topic

### 2. **Track Progress**
- Monitor daily activity and streaks
- Review problems at optimal intervals
- Identify weak areas for focused practice

### 3. **Learn Systematically**
- Use spaced repetition for better retention
- Learn from mistakes and solution iterations
- Build a personal knowledge base

## 🔧 Development

### Project Structure
```
leetspace/
├── backend/                 # FastAPI backend
│   ├── auth/               # Firebase authentication
│   ├── db/                 # MongoDB database layer
│   ├── models/             # Data models
│   ├── routes/             # API endpoints
│   └── services/           # Business logic
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   └── lib/            # Utilities and services
│   └── public/             # Static assets
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance & Scalability

- **Async Backend**: Built with FastAPI for high concurrency
- **Database Optimization**: Indexed queries for fast data retrieval
- **Frontend Performance**: Code splitting and lazy loading
- **Caching Strategy**: Efficient data fetching and state management

##  Security

- **Firebase Authentication**: Industry-standard user management
- **JWT Tokens**: Secure API access control
- **Input Validation**: Pydantic models for data sanitization
- **CORS Configuration**: Configurable cross-origin resource sharing

##  Roadmap

- [ ] **Collaborative Features**: Study groups and peer learning
- [ ] **AI-Powered Insights**: Smart problem recommendations
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Integration APIs**: Connect with other learning platforms
- [ ] **Advanced Analytics**: Machine learning insights and predictions

## Support

- **Documentation**: [Coming Soon]
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join community conversations
- **Email**: [Contact Information]

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Built by**: Karthik Reddy Vemireddy and Deepak Kukkapalli
- **Project**: myLEETSPACE
- **Inspiration**: Spaced repetition research and learning science
- **Community**: Powered by the open-source community

---

**Ready to transform your coding practice?** [Start your journal today](https://myleetspace.com) or explore the [demo workspace](https://myleetspace.com/demo).

*LeetSpace - Where systematic learning meets coding excellence.*