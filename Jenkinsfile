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
                sh 'npm run install-all'
            }
        }
        
        stage('Security Audit') {
            steps {
                echo 'Running npm audit to check for vulnerabilities...'
                sh 'cd Backend && npm audit --audit-level=high || true'
                sh 'cd Frontend && npm audit --audit-level=high || true'
            }
        }

        stage('Lint Code') {
            steps {
                echo 'Running linting...'
                sh 'npm run lint-all'
            }
        }

        stage('Test Code') {
            steps {
                echo 'Running tests...'
                sh 'npm run test-all'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building frontend...'
                sh 'npm run build-all'
            }
        }
        
        stage('Docker Build') {
            steps {
                echo 'Building Docker images using docker-compose...'
                sh 'docker-compose build'
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
