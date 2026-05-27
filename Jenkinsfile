pipeline {
    agent any

    environment {
        NODE_ENV = 'development'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies for root, backend, and frontend...'
                bat 'npm run install-all'
            }
        }

        stage('Security Audit') {
            steps {
                echo 'Running npm audit to check for vulnerabilities...'
                bat 'cd Backend && npm audit --audit-level=high || exit 0'
                bat 'cd Frontend && npm audit --audit-level=high || exit 0'
            }
        }

        stage('Lint Code') {
            steps {
                echo 'Running linting...'
                bat 'npm run lint-all'
            }
        }

        stage('Test Code') {
            steps {
                echo 'Running tests...'
                bat 'npm run test-all'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building frontend...'
                bat 'npm run build-all'
            }
        }

        stage('Create Backend Env') {
            steps {
                withCredentials([
                    string(credentialsId: 'MONGODB_URI', variable: 'MONGODB_URI'),
                    string(credentialsId: 'ACCESS_TOKEN_SECRET', variable: 'ACCESS_TOKEN_SECRET'),
                    string(credentialsId: 'REFRESH_TOKEN_SECRET', variable: 'REFRESH_TOKEN_SECRET'),
                    string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_CLIENT_ID'),
                    string(credentialsId: 'GOOGLE_CLIENT_SECRET', variable: 'GOOGLE_CLIENT_SECRET'),
                    string(credentialsId: 'FACEBOOK_APP_ID', variable: 'FACEBOOK_APP_ID'),
                    string(credentialsId: 'FACEBOOK_APP_SECRET', variable: 'FACEBOOK_APP_SECRET'),
                    string(credentialsId: 'CLOUDINARY_CLOUD_NAME', variable: 'CLOUDINARY_CLOUD_NAME'),
                    string(credentialsId: 'CLOUDINARY_API_KEY', variable: 'CLOUDINARY_API_KEY'),
                    string(credentialsId: 'CLOUDINARY_API_SECRET', variable: 'CLOUDINARY_API_SECRET'),
                    string(credentialsId: 'OPENROUTER_API_KEY', variable: 'OPENROUTER_API_KEY'),
                    string(credentialsId: 'GEMINI_API_KEY', variable: 'GEMINI_API_KEY'),
                    string(credentialsId: 'RAZORPAY_KEY_ID', variable: 'RAZORPAY_KEY_ID'),
                    string(credentialsId: 'RAZORPAY_KEY_SECRET', variable: 'RAZORPAY_KEY_SECRET'),
                    string(credentialsId: 'RESEND_API_KEY', variable: 'RESEND_API_KEY')
                ]) {
                    bat '''
                    (
                    echo PORT=5000
                    echo MONGODB_URI=%MONGODB_URI%
                    echo CORS_ORIGIN=http://localhost:3000
                    echo ACCESS_TOKEN_SECRET=%ACCESS_TOKEN_SECRET%
                    echo ACCESS_TOKEN_EXPIRY=1d
                    echo REFRESH_TOKEN_SECRET=%REFRESH_TOKEN_SECRET%
                    echo REFRESH_TOKEN_EXPIRY=10d
                    echo GOOGLE_CLIENT_ID=%GOOGLE_CLIENT_ID%
                    echo GOOGLE_CLIENT_SECRET=%GOOGLE_CLIENT_SECRET%
                    echo GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/users/google/callback
                    echo CLIENT_URL=http://localhost:3000
                    echo FACEBOOK_APP_ID=%FACEBOOK_APP_ID%
                    echo FACEBOOK_APP_SECRET=%FACEBOOK_APP_SECRET%
                    echo FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/users/facebook/callback
                    echo CLOUDINARY_CLOUD_NAME=%CLOUDINARY_CLOUD_NAME%
                    echo CLOUDINARY_API_KEY=%CLOUDINARY_API_KEY%
                    echo CLOUDINARY_API_SECRET=%CLOUDINARY_API_SECRET%
                    echo BASE_URL=https://openrouter.ai/api/v1
                    echo OPENROUTER_API_KEY=%OPENROUTER_API_KEY%
                    echo GEMINI_API_KEY=%GEMINI_API_KEY%
                    echo RAZORPAY_KEY_ID=%RAZORPAY_KEY_ID%
                    echo RAZORPAY_KEY_SECRET=%RAZORPAY_KEY_SECRET%
                    echo RESEND_API_KEY=%RESEND_API_KEY%
                    echo RESEND_FROM_EMAIL=Zaika Vault ^<onboarding@resend.dev^>
                    ) > Backend\\.env
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker images using docker-compose...'
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        always {
            echo 'Archiving artifacts...'
            archiveArtifacts artifacts: 'Frontend/dist/**', fingerprint: true, allowEmptyArchive: true
            echo 'Pipeline completed.'
        }
        success {
            echo 'Pipeline executed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}