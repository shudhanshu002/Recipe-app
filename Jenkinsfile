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
        
        stage('Docker Build') {
            steps {
                echo 'Building Docker images using docker-compose...'
                bat 'docker-compose up -d --build'
            }
        }
        
        // stage('SonarQube Analysis') {
        //     environment {
        //         // Requires 'SonarQube Scanner' configured in Jenkins
        //         scannerHome = tool 'SonarQubeScanner'
        //     }
        //     steps {
        //         withSonarQubeEnv('My SonarQube Server') {
        //             sh "${scannerHome}/bin/sonar-scanner"
        //         }
        //     }
        // }
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
