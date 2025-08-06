#!/bin/bash

echo "🚀 Starting LeetSpace Development Environment"
echo "============================================"

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "✅ $service is already running on port $port"
        return 0
    else
        echo "❌ $service is not running on port $port"
        return 1
    fi
}

# Function to start a service in background
start_service() {
    local cmd="$1"
    local service="$2"
    local port="$3"
    local log_file="$4"
    
    echo "🔄 Starting $service..."
    eval "$cmd > $log_file 2>&1 &"
    sleep 3
    
    if check_port "$port" "$service"; then
        echo "✅ $service started successfully"
    else
        echo "❌ Failed to start $service"
        echo "   Check log: $log_file"
    fi
}

echo ""
echo "📧 Starting MailHog SMTP Server..."
if ! check_port 8025 "MailHog"; then
    start_service "./mailhog" "MailHog" 8025 "mailhog.log"
fi

echo ""
echo "🔧 Starting Backend API..."
if ! check_port 8000 "Backend"; then
    cd /workspace/backend
    start_service "python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" "Backend" 8000 "backend.log"
    cd /workspace
fi

echo ""
echo "🌐 Starting Frontend..."
if ! check_port 3000 "Frontend"; then
    cd /workspace/frontend/leetspace-frontend
    start_service "npm run dev -- --host 0.0.0.0 --port 3000" "Frontend" 3000 "frontend.log"
    cd /workspace
fi

echo ""
echo "🎯 LeetSpace Status Check"
echo "========================"

sleep 5

# Final status check
if check_port 8025 "MailHog" && check_port 8000 "Backend" && check_port 3000 "Frontend"; then
    echo ""
    echo "🎉 ALL SERVICES RUNNING SUCCESSFULLY!"
    echo ""
    echo "📱 Access your application:"
    echo "   🌐 Frontend:  http://localhost:3000"
    echo "   📧 Email UI:  http://localhost:8025"
    echo "   🔧 Backend:   http://localhost:8000/docs"
    echo ""
    echo "🔍 View emails:"
    echo "   📧 Command:   python3 view_emails_production.py"
    echo "   🌐 Web UI:    http://localhost:8025"
    echo ""
    echo "✅ Ready for testing!"
else
    echo ""
    echo "⚠️ Some services failed to start. Check the logs:"
    echo "   MailHog: mailhog.log"
    echo "   Backend: backend/backend.log"
    echo "   Frontend: frontend/leetspace-frontend/frontend.log"
fi