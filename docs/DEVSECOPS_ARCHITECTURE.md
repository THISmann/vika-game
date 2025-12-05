# 🔒 Architecture DevSecOps - IntelectGame V2

**Version**: 1.0  
**Auteur**: DevSecOps Engineer Senior  
**Dernière mise à jour**: Décembre 2024

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de Sécurité](#architecture-de-sécurité)
3. [SAST (Static Application Security Testing)](#sast-static-application-security-testing)
4. [DAST (Dynamic Application Security Testing)](#dast-dynamic-application-security-testing)
5. [SCA (Software Composition Analysis)](#sca-software-composition-analysis)
6. [Sécurité Frontend](#sécurité-frontend)
7. [Sécurité Microservices](#sécurité-microservices)
8. [Sécurité Kubernetes](#sécurité-kubernetes)
9. [Pipeline CI/CD Sécurisé](#pipeline-cicd-sécurisé)
10. [Secrets Management](#secrets-management)
11. [Network Security](#network-security)
12. [Container Security](#container-security)
13. [Runtime Security](#runtime-security)
14. [Compliance et Audit](#compliance-et-audit)
15. [Monitoring et Alerting](#monitoring-et-alerting)
16. [Plan d'Implémentation](#plan-dimplémentation)

---

## Vue d'ensemble

Cette architecture DevSecOps implémente la sécurité **"Shift Left"** et **"Defense in Depth"** à tous les niveaux de l'application, depuis le développement jusqu'à la production.

### Principes de Sécurité

1. **Security by Design**: Sécurité intégrée dès la conception
2. **Least Privilege**: Principe du moindre privilège
3. **Defense in Depth**: Multiples couches de sécurité
4. **Zero Trust**: Aucune confiance par défaut
5. **Continuous Security**: Sécurité continue dans le pipeline CI/CD

### Outils et Technologies

| Catégorie | Outils |
|-----------|--------|
| **SAST** | SonarQube, ESLint Security Plugin, Semgrep |
| **DAST** | OWASP ZAP, Burp Suite, Nuclei |
| **SCA** | Snyk, Dependabot, OWASP Dependency-Check |
| **Container Security** | Trivy, Clair, Falco |
| **Secrets Management** | HashiCorp Vault, Kubernetes Secrets, Sealed Secrets |
| **Network Security** | Network Policies, Istio Service Mesh |
| **Runtime Security** | Falco, OPA Gatekeeper, Kyverno |
| **Compliance** | Open Policy Agent (OPA), Polaris |

---

## Architecture de Sécurité

### Schéma Global

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline Sécurisé                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   SAST   │  │   SCA    │  │   DAST   │  │  Container│       │
│  │ SonarQube│  │   Snyk   │  │   ZAP    │  │   Trivy   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Secrets Management                            │
│                    HashiCorp Vault                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster Sécurisé                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ RBAC         │  │ Network      │  │ Pod Security │          │
│  │ Policies     │  │ Policies     │  │ Standards    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ OPA          │  │ Falco        │  │ Kyverno      │          │
│  │ Gatekeeper   │  │ Runtime      │  │ Policies     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Frontend     │  │ Microservices│  │ API Gateway  │          │
│  │ CSP, XSS    │  │ JWT, Input   │  │ Rate Limit   │          │
│  │ Protection   │  │ Validation   │  │ WAF          │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Monitoring & Alerting                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Security     │  │ SIEM         │  │ Incident     │          │
│  │ Events       │  │ (ELK Stack)  │  │ Response     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## SAST (Static Application Security Testing)

### Outils et Configuration

#### 1. SonarQube

**Déploiement Kubernetes**:

```yaml
# k8s/security/sonarqube-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sonarqube
  namespace: security
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: sonarqube
        image: sonarqube:community
        ports:
        - containerPort: 9000
        env:
        - name: SONAR_JDBC_URL
          valueFrom:
            secretKeyRef:
              name: sonarqube-db-secret
              key: jdbc-url
        - name: SONAR_JDBC_USERNAME
          valueFrom:
            secretKeyRef:
              name: sonarqube-db-secret
              key: username
        - name: SONAR_JDBC_PASSWORD
          valueFrom:
            secretKeyRef:
              name: sonarqube-db-secret
              key: password
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: sonarqube
  namespace: security
spec:
  type: ClusterIP
  ports:
  - port: 9000
    targetPort: 9000
```

**Configuration SonarQube** (`sonar-project.properties`):

```properties
# sonar-project.properties (root)
sonar.projectKey=intelectgame-v2
sonar.projectName=IntelectGame V2
sonar.projectVersion=2.0

# Source code
sonar.sources=node,vue/front/src
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/*.test.js

# Language
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Security rules
sonar.javascript.security.qualityProfile=OWASP Top 10
sonar.security.hotspots.enabled=true

# Coverage
sonar.javascript.coverage.min=70
```

**Intégration GitHub Actions**:

```yaml
# .github/workflows/sast-sonarqube.yml
name: SAST - SonarQube

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd node/auth-service && npm ci
          cd ../quiz-service && npm ci
          cd ../game-service && npm ci
          cd ../../vue/front && npm ci

      - name: Run tests with coverage
        run: |
          npm run test:coverage

      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        with:
          args: >
            -Dsonar.projectKey=intelectgame-v2
            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            -Dsonar.security.hotspots.enabled=true
            -Dsonar.qualitygate.wait=true

      - name: Quality Gate Check
        uses: sonarsource/sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

#### 2. ESLint Security Plugin

**Configuration** (`package.json`):

```json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-plugin-security": "^1.7.1",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  },
  "scripts": {
    "lint:security": "eslint . --ext .js,.vue --plugin security --format json --output-file eslint-security-report.json"
  }
}
```

**Configuration ESLint** (`.eslintrc.js`):

```javascript
module.exports = {
  extends: [
    'plugin:security/recommended'
  ],
  plugins: ['security'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-no-hardcoded-credentials': 'error',
    'security/detect-no-hardcoded-secret': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error'
  }
}
```

**Intégration CI/CD**:

```yaml
# .github/workflows/sast-eslint.yml
name: SAST - ESLint Security

on: [push, pull_request]

jobs:
  eslint-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint Security
        run: npm run lint:security
      
      - name: Upload ESLint Report
        uses: actions/upload-artifact@v3
        with:
          name: eslint-security-report
          path: eslint-security-report.json
```

---

#### 3. Semgrep

**Configuration** (`.semgrep.yml`):

```yaml
rules:
  - id: detect-sql-injection
    pattern: |
      $QUERY = "SELECT ... WHERE id = " + $USER_INPUT
    message: Potential SQL injection vulnerability
    languages: [javascript]
    severity: ERROR

  - id: detect-command-injection
    pattern: |
      exec($USER_INPUT)
    message: Potential command injection vulnerability
    languages: [javascript]
    severity: ERROR

  - id: detect-xss
    pattern: |
      $RESPONSE.send($USER_INPUT)
    message: Potential XSS vulnerability
    languages: [javascript]
    severity: ERROR

  - id: detect-hardcoded-secrets
    pattern: |
      password = "$SECRET"
    message: Hardcoded secret detected
    languages: [javascript]
    severity: ERROR
```

**Intégration CI/CD**:

```yaml
# .github/workflows/sast-semgrep.yml
name: SAST - Semgrep

on: [push, pull_request]

jobs:
  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten
            p/javascript
            p/nodejs
          generateSarif: "1"
      
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: semgrep.sarif
```

---

## DAST (Dynamic Application Security Testing)

### 1. OWASP ZAP

**Déploiement Kubernetes**:

```yaml
# k8s/security/zap-deployment.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: zap-scan
  namespace: security
spec:
  template:
    spec:
      containers:
      - name: zap
        image: owasp/zap2docker-stable
        command:
        - zap-baseline.py
        - -t
        - http://nginx-proxy.intelectgame.svc.cluster.local:80
        - -J
        - zap-report.json
        - -r
        - zap-report.html
        env:
        - name: ZAP_AUTH_HEADER
          value: "Authorization: Bearer $TOKEN"
        volumeMounts:
        - name: zap-reports
          mountPath: /zap/wrk
      volumes:
      - name: zap-reports
        emptyDir: {}
      restartPolicy: Never
```

**Intégration CI/CD**:

```yaml
# .github/workflows/dast-zap.yml
name: DAST - OWASP ZAP

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  zap-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Start application
        run: |
          docker-compose up -d
          sleep 30
      
      - name: Run ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.10.0
        with:
          target: 'http://localhost:30081'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
      
      - name: Upload ZAP Report
        uses: actions/upload-artifact@v3
        with:
          name: zap-report
          path: zap_report.html
      
      - name: ZAP Full Scan
        if: github.event_name == 'schedule'
        uses: zaproxy/action-full-scan@v0.10.0
        with:
          target: 'http://localhost:30081'
          rules_file_name: '.zap/rules.tsv'
```

---

### 2. Nuclei

**Configuration** (`nuclei-config.yaml`):

```yaml
# nuclei-config.yaml
templates:
  - /nuclei-templates/cves/
  - /nuclei-templates/vulnerabilities/
  - /nuclei-templates/exposures/
  - /nuclei-templates/misconfiguration/

severity:
  - critical
  - high
  - medium

rate-limit: 150
bulk-size: 25
timeout: 10
```

**Intégration CI/CD**:

```yaml
# .github/workflows/dast-nuclei.yml
name: DAST - Nuclei

on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM
  workflow_dispatch:

jobs:
  nuclei-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Nuclei Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          target: 'http://localhost:30081'
          config: 'nuclei-config.yaml'
          severity: 'critical,high,medium'
      
      - name: Upload Nuclei Report
        uses: actions/upload-artifact@v3
        with:
          name: nuclei-report
          path: nuclei-report.json
```

---

## SCA (Software Composition Analysis)

### 1. Snyk

**Configuration** (`.snyk`):

```yaml
# .snyk
version: v1.0.0
ignore: {}
patch: {}
```

**Intégration CI/CD**:

```yaml
# .github/workflows/sca-snyk.yml
name: SCA - Snyk

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  snyk-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Upload Snyk results to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif
      
      - name: Snyk Monitor
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: monitor
          args: --severity-threshold=high

  snyk-container:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t test-image ./node/auth-service
      
      - name: Run Snyk to check Docker image for vulnerabilities
        uses: snyk/actions/docker@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          image: test-image
          args: --severity-threshold=high
```

---

### 2. Dependabot

**Configuration** (`.github/dependabot.yml`):

```yaml
# .github/dependabot.yml
version: 2
updates:
  # Node.js dependencies
  - package-ecosystem: "npm"
    directory: "/node/auth-service"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "security"
      - "dependencies"
    commit-message:
      prefix: "security"
      include: "scope"

  - package-ecosystem: "npm"
    directory: "/node/quiz-service"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "npm"
    directory: "/node/game-service"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "npm"
    directory: "/vue/front"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  # Docker dependencies
  - package-ecosystem: "docker"
    directory: "/node/auth-service"
    schedule:
      interval: "weekly"

  - package-ecosystem: "docker"
    directory: "/node/quiz-service"
    schedule:
      interval: "weekly"

  - package-ecosystem: "docker"
    directory: "/node/game-service"
    schedule:
      interval: "weekly"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

### 3. OWASP Dependency-Check

**Intégration CI/CD**:

```yaml
# .github/workflows/sca-owasp-dependency-check.yml
name: SCA - OWASP Dependency-Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run OWASP Dependency-Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'IntelectGame V2'
          path: '.'
          format: 'HTML'
          args: >
            --enableRetired
            --enableExperimental
            --failOnCVSS 7
      
      - name: Upload Dependency-Check Report
        uses: actions/upload-artifact@v3
        with:
          name: dependency-check-report
          path: reports/
```

---

## Sécurité Frontend

### 1. Content Security Policy (CSP)

**Configuration** (`vue/front/index.html`):

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' ws: wss:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  ">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta http-equiv="X-XSS-Protection" content="1; mode=block">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
</head>
```

**Configuration Nginx**:

```nginx
# k8s/nginx-proxy-config.yaml
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

### 2. Input Validation et Sanitization

**Configuration Vue** (`vue/front/src/utils/sanitize.js`):

```javascript
// vue/front/src/utils/sanitize.js
import DOMPurify from 'dompurify'

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

export function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validateGameCode(code) {
  return /^[A-Z0-9]{6}$/.test(code)
}
```

**Utilisation**:

```vue
<!-- vue/front/src/components/player/PlayerRegister.vue -->
<script>
import { sanitizeInput, validateGameCode } from '@/utils/sanitize'

export default {
  methods: {
    verifyCode() {
      const code = sanitizeInput(this.gameCode.toUpperCase())
      if (!validateGameCode(code)) {
        this.error = 'Code invalide'
        return
      }
      // ... reste du code
    }
  }
}
</script>
```

---

### 3. XSS Protection

**Configuration Axios** (`vue/front/src/config/axios.js`):

```javascript
// vue/front/src/config/axios.js
import axios from 'axios'
import { sanitizeInput } from '@/utils/sanitize'

// Intercepteur pour sanitizer les réponses
axios.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = sanitizeResponse(response.data)
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

function sanitizeResponse(data) {
  if (typeof data === 'string') {
    return sanitizeInput(data)
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeResponse)
  }
  if (data && typeof data === 'object') {
    const sanitized = {}
    for (const key in data) {
      sanitized[key] = sanitizeResponse(data[key])
    }
    return sanitized
  }
  return data
}
```

---

## Sécurité Microservices

### 1. Input Validation

**Configuration Joi** (`node/auth-service/validators/user.validator.js`):

```javascript
// node/auth-service/validators/user.validator.js
const Joi = require('joi')

const userSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z0-9\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name contains invalid characters',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must be at most 50 characters'
    })
})

const loginSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
    })
})

function validateUser(req, res, next) {
  const { error, value } = userSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  req.body = value
  next()
}

function validateLogin(req, res, next) {
  const { error, value } = loginSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  req.body = value
  next()
}

module.exports = { validateUser, validateLogin }
```

---

### 2. SQL Injection Protection

**Configuration Mongoose** (déjà sécurisé, mais validation supplémentaire):

```javascript
// node/quiz-service/controllers/quiz.controller.js
const createQuestion = async (req, res) => {
  try {
    // Validation stricte avec Joi
    const { error, value } = questionSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    
    // Mongoose échappe automatiquement les injections
    const question = new Question(value)
    await question.save()
    
    res.status(201).json(question)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

---

### 3. Rate Limiting

**Configuration Express Rate Limit** (`node/auth-service/middleware/rateLimit.js`):

```javascript
// node/auth-service/middleware/rateLimit.js
const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const redis = require('redis')

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
})

// Rate limit pour login (5 tentatives par 15 minutes)
const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:login:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limit général (100 requêtes par 15 minutes)
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = { loginLimiter, apiLimiter }
```

**Utilisation**:

```javascript
// node/auth-service/routes/auth.routes.js
const { loginLimiter, apiLimiter } = require('../middleware/rateLimit')

router.post('/admin/login', loginLimiter, authController.login)
router.use(apiLimiter) // Applique à toutes les routes
```

---

### 4. Helmet.js

**Configuration** (`node/auth-service/server.js`):

```javascript
// node/auth-service/server.js
const helmet = require('helmet')

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}))
```

---

## Sécurité Kubernetes

### 1. RBAC (Role-Based Access Control)

**Configuration** (`k8s/security/rbac.yaml`):

```yaml
# k8s/security/rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: intelectgame-sa
  namespace: intelectgame
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: intelectgame-role
  namespace: intelectgame
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: intelectgame-rolebinding
  namespace: intelectgame
subjects:
- kind: ServiceAccount
  name: intelectgame-sa
  namespace: intelectgame
roleRef:
  kind: Role
  name: intelectgame-role
  apiGroup: rbac.authorization.k8s.io
```

---

### 2. Network Policies

**Configuration** (`k8s/security/network-policies.yaml`):

```yaml
# k8s/security/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: auth-service-netpol
  namespace: intelectgame
spec:
  podSelector:
    matchLabels:
      app: auth-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nginx-proxy
    ports:
    - protocol: TCP
      port: 3001
  - from:
    - podSelector:
        matchLabels:
          app: game-service
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: mongodb
    ports:
    - protocol: TCP
      port: 27017
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mongodb-netpol
  namespace: intelectgame
spec:
  podSelector:
    matchLabels:
      app: mongodb
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: auth-service
    ports:
    - protocol: TCP
      port: 27017
  - from:
    - podSelector:
        matchLabels:
          app: quiz-service
    ports:
    - protocol: TCP
      port: 27017
  - from:
    - podSelector:
        matchLabels:
          app: game-service
    ports:
    - protocol: TCP
      port: 27017
```

---

### 3. Pod Security Standards

**Configuration** (`k8s/security/pod-security.yaml`):

```yaml
# k8s/security/pod-security.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: intelectgame
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
---
# Exemple de deployment avec sécurité renforcée
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: intelectgame
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
      - name: auth-service
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
          runAsNonRoot: true
          runAsUser: 1000
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: data
          mountPath: /app/data
      volumes:
      - name: tmp
        emptyDir: {}
      - name: data
        emptyDir: {}
```

---

### 4. OPA Gatekeeper

**Installation**:

```bash
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/release-3.14/deploy/gatekeeper.yaml
```

**Policies** (`k8s/security/opa-policies.yaml`):

```yaml
# k8s/security/opa-policies.yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg}] {
          required := input.parameters.labels
          provided := input.review.object.metadata.labels
          missing := required[_]
          not provided[missing]
          msg := sprintf("Missing required label: %v", [missing])
        }
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: must-have-app-label
spec:
  match:
    kinds:
      - apiGroups: ["apps"]
        kinds: ["Deployment"]
  parameters:
    labels: ["app"]
```

---

### 5. Kyverno Policies

**Installation**:

```bash
kubectl apply -f https://github.com/kyverno/kyverno/releases/latest/download/install.yaml
```

**Policies** (`k8s/security/kyverno-policies.yaml`):

```yaml
# k8s/security/kyverno-policies.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: enforce
  rules:
  - name: check-for-labels
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "Labels 'app' and 'version' are required"
      pattern:
        metadata:
          labels:
            app: "?*"
            version: "?*"
---
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-default-namespace
spec:
  validationFailureAction: enforce
  rules:
  - name: check-default-namespace
    match:
      resources:
        kinds:
        - Pod
        - Service
        - Deployment
    validate:
      message: "Using 'default' namespace is not allowed"
      pattern:
        metadata:
          namespace: "!default"
---
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-resource-limits
spec:
  validationFailureAction: enforce
  rules:
  - name: check-resource-limits
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "Resource limits are required"
      pattern:
        spec:
          containers:
          - name: "*"
            resources:
              limits:
                memory: "?*"
                cpu: "?*"
              requests:
                memory: "?*"
                cpu: "?*"
```

---

## Pipeline CI/CD Sécurisé

### Workflow Complet

```yaml
# .github/workflows/security-pipeline.yml
name: Security Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * *'  # Daily

jobs:
  # SAST
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      
      - name: ESLint Security
        run: npm run lint:security
      
      - name: Semgrep Scan
        uses: returntocorp/semgrep-action@v1
      
  # SCA
  sca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Snyk Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: OWASP Dependency-Check
        uses: dependency-check/Dependency-Check_Action@main
      
  # Container Security
  container-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t test-image ./node/auth-service
      
      - name: Trivy Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: test-image
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: trivy-results.sarif
      
      - name: Snyk Container Scan
        uses: snyk/actions/docker@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          image: test-image
      
  # DAST (only on main branch)
  dast:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: [sast, sca, container-security]
    steps:
      - uses: actions/checkout@v4
      
      - name: Start application
        run: |
          docker-compose up -d
          sleep 30
      
      - name: OWASP ZAP Scan
        uses: zaproxy/action-baseline@v0.10.0
        with:
          target: 'http://localhost:30081'
      
      - name: Nuclei Scan
        uses: projectdiscovery/nuclei-action@main
        with:
          target: 'http://localhost:30081'
      
  # Security Gate
  security-gate:
    runs-on: ubuntu-latest
    needs: [sast, sca, container-security]
    steps:
      - name: Check Security Gate
        run: |
          # Fail if any critical vulnerabilities found
          if [ "${{ needs.sast.result }}" != "success" ]; then
            echo "SAST failed"
            exit 1
          fi
          if [ "${{ needs.sca.result }}" != "success" ]; then
            echo "SCA failed"
            exit 1
          fi
          if [ "${{ needs.container-security.result }}" != "success" ]; then
            echo "Container security failed"
            exit 1
          fi
          echo "✅ Security gate passed"
```

---

## Secrets Management

### 1. HashiCorp Vault

**Déploiement Kubernetes**:

```yaml
# k8s/security/vault-deployment.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: vault
  namespace: security
spec:
  serviceName: vault
  replicas: 1
  template:
    spec:
      containers:
      - name: vault
        image: hashicorp/vault:latest
        ports:
        - containerPort: 8200
        env:
        - name: VAULT_DEV_ROOT_TOKEN_ID
          valueFrom:
            secretKeyRef:
              name: vault-secret
              key: root-token
        - name: VAULT_DEV_LISTEN_ADDRESS
          value: "0.0.0.0:8200"
        volumeMounts:
        - name: vault-data
          mountPath: /vault/data
      volumes:
      - name: vault-data
        persistentVolumeClaim:
          claimName: vault-pvc
```

**Intégration avec Kubernetes**:

```yaml
# k8s/security/vault-auth.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: vault-auth
  namespace: intelectgame
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: role-tokenreview-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:auth-delegator
subjects:
- kind: ServiceAccount
  name: vault-auth
  namespace: intelectgame
```

---

### 2. Sealed Secrets

**Installation**:

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

**Utilisation**:

```bash
# Créer un secret scellé
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="your-token" \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > k8s/sealed-secrets/telegram-bot-sealed-secret.yaml
```

---

## Network Security

### 1. Istio Service Mesh

**Installation**:

```bash
istioctl install --set values.defaultRevision=default
```

**Configuration mTLS**:

```yaml
# k8s/security/istio-mtls.yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: intelectgame
spec:
  mtls:
    mode: STRICT
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-auth-service
  namespace: intelectgame
spec:
  selector:
    matchLabels:
      app: auth-service
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/intelectgame/sa/nginx-proxy"]
    to:
    - operation:
        methods: ["GET", "POST"]
```

---

## Container Security

### 1. Trivy

**Intégration CI/CD**:

```yaml
# .github/workflows/container-security.yml
name: Container Security - Trivy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t test-image ./node/auth-service
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: test-image
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: trivy-results.sarif
```

---

### 2. Falco (Runtime Security)

**Déploiement**:

```yaml
# k8s/security/falco-deployment.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: falco
  namespace: security
spec:
  selector:
    matchLabels:
      app: falco
  template:
    spec:
      containers:
      - name: falco
        image: falcosecurity/falco:latest
        securityContext:
          privileged: true
        volumeMounts:
        - name: falco-config
          mountPath: /etc/falco
        - name: falco-rules
          mountPath: /etc/falco/rules.d
      volumes:
      - name: falco-config
        configMap:
          name: falco-config
      - name: falco-rules
        configMap:
          name: falco-rules
```

**Règles Falco** (`k8s/security/falco-rules.yaml`):

```yaml
# k8s/security/falco-rules.yaml
- rule: Detect shell in container
  desc: Notice shell activity within a container
  condition: >
    spawned_process and container and
    shell_procs and proc.tty != 0 and
    not container_entrypoint
  output: >
    Shell spawned in container (user=%user.name container_id=%container.id
    container_name=%container.name shell=%proc.name parent=%proc.pname
    cmdline=%proc.cmdline terminal=%proc.tty container_image=%container.image.repository)
  priority: WARNING
  tags: [container, shell, mitre_execution]

- rule: Detect crypto mining
  desc: Detect crypto mining activity
  condition: >
    spawned_process and container and
    (proc.name in (crypto_miners) or
     proc.cmdline contains "minerd" or
     proc.cmdline contains "cpuminer")
  output: >
    Crypto mining activity detected (user=%user.name container_id=%container.id
    container_name=%container.name proc=%proc.name cmdline=%proc.cmdline)
  priority: CRITICAL
  tags: [container, crypto, mitre_execution]
```

---

## Runtime Security

### 1. OPA Gatekeeper (déjà couvert)

### 2. Kyverno (déjà couvert)

### 3. Polaris

**Installation**:

```bash
kubectl apply -f https://raw.githubusercontent.com/FairwindsOps/polaris/main/deployment/dashboard.yaml
```

**Configuration** (`k8s/security/polaris-config.yaml`):

```yaml
# k8s/security/polaris-config.yaml
checks:
  security:
    runAsRootAllowed: danger
    runAsPrivileged: danger
    hostIPCSet: danger
    hostPIDSet: danger
    hostNetworkSet: danger
    hostPortSet: warning
    notReadOnlyRootFilesystem: warning
  resources:
    cpuLimitsMissing: warning
    memoryLimitsMissing: warning
    cpuRequestsMissing: warning
    memoryRequestsMissing: warning
```

---

## Compliance et Audit

### 1. Kubernetes Audit Logging

**Configuration** (`k8s/security/audit-policy.yaml`):

```yaml
# k8s/security/audit-policy.yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata
  namespaces: ["intelectgame"]
  verbs: ["create", "update", "patch", "delete"]
- level: RequestResponse
  resources:
  - group: ""
    resources: ["secrets"]
- level: Request
  resources:
  - group: ""
    resources: ["pods", "services"]
```

---

### 2. Compliance Scanning

**Polaris Dashboard**:

```yaml
# k8s/security/polaris-dashboard.yaml
apiVersion: v1
kind: Service
metadata:
  name: polaris-dashboard
  namespace: security
spec:
  type: NodePort
  ports:
  - port: 8080
    targetPort: 8080
    nodePort: 30082
  selector:
    app: polaris-dashboard
```

---

## Monitoring et Alerting

### 1. Security Events Dashboard

**Grafana Dashboard** (`k8s/security/grafana-security-dashboard.json`):

```json
{
  "dashboard": {
    "title": "Security Events",
    "panels": [
      {
        "title": "Security Vulnerabilities",
        "targets": [
          {
            "expr": "sum(security_vulnerabilities_total{severity=\"critical\"})"
          }
        ]
      },
      {
        "title": "Failed Login Attempts",
        "targets": [
          {
            "expr": "sum(rate(auth_login_failures_total[5m]))"
          }
        ]
      },
      {
        "title": "Container Security Events",
        "targets": [
          {
            "expr": "sum(falco_events_total{priority=\"CRITICAL\"})"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Alerting Rules

**Prometheus Alerts** (`k8s/security/prometheus-alerts.yaml`):

```yaml
# k8s/security/prometheus-alerts.yaml
groups:
- name: security
  rules:
  - alert: CriticalVulnerabilityDetected
    expr: security_vulnerabilities_total{severity="critical"} > 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Critical security vulnerability detected"
      description: "{{ $labels.service }} has {{ $value }} critical vulnerabilities"
  
  - alert: HighFailedLoginAttempts
    expr: rate(auth_login_failures_total[5m]) > 10
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High number of failed login attempts"
      description: "{{ $value }} failed login attempts per second"
  
  - alert: ContainerSecurityBreach
    expr: falco_events_total{priority="CRITICAL"} > 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Container security breach detected"
      description: "Falco detected a critical security event: {{ $labels.rule }}"
```

---

## Plan d'Implémentation

### Phase 1: Fondations (Semaine 1-2)

1. ✅ Configurer SAST (SonarQube, ESLint, Semgrep)
2. ✅ Configurer SCA (Snyk, Dependabot)
3. ✅ Intégrer dans pipeline CI/CD
4. ✅ Configurer secrets management (Vault/Sealed Secrets)

**Livrables**:
- Pipeline CI/CD avec SAST/SCA
- Secrets management opérationnel
- Rapports de sécurité automatisés

---

### Phase 2: Sécurité Application (Semaine 3-4)

1. ✅ Implémenter CSP et headers de sécurité
2. ✅ Input validation et sanitization
3. ✅ Rate limiting
4. ✅ JWT authentication
5. ✅ Helmet.js sur tous les services

**Livrables**:
- Application sécurisée au niveau code
- Protection contre XSS, CSRF, injection
- Authentification robuste

---

### Phase 3: Sécurité Kubernetes (Semaine 5-6)

1. ✅ RBAC configuré
2. ✅ Network Policies
3. ✅ Pod Security Standards
4. ✅ OPA Gatekeeper
5. ✅ Kyverno Policies

**Livrables**:
- Cluster Kubernetes sécurisé
- Isolation réseau
- Policies d'admission

---

### Phase 4: Container et Runtime (Semaine 7-8)

1. ✅ Container scanning (Trivy)
2. ✅ Falco pour runtime security
3. ✅ Polaris pour compliance
4. ✅ Istio Service Mesh (optionnel)

**Livrables**:
- Containers sécurisés
- Détection runtime
- Compliance vérifiée

---

### Phase 5: Monitoring et Compliance (Semaine 9-10)

1. ✅ Security events dashboard
2. ✅ Alerting configuré
3. ✅ Audit logging
4. ✅ Compliance scanning

**Livrables**:
- Monitoring sécurité opérationnel
- Alertes automatiques
- Audit trail complet

---

## Résumé

Cette architecture DevSecOps implémente :

✅ **SAST**: SonarQube, ESLint Security, Semgrep  
✅ **DAST**: OWASP ZAP, Nuclei  
✅ **SCA**: Snyk, Dependabot, OWASP Dependency-Check  
✅ **Container Security**: Trivy, Falco  
✅ **Secrets Management**: Vault, Sealed Secrets  
✅ **Kubernetes Security**: RBAC, Network Policies, OPA, Kyverno  
✅ **Application Security**: CSP, Input Validation, Rate Limiting, JWT  
✅ **Monitoring**: Grafana, Prometheus, Alerting  
✅ **Compliance**: Polaris, Audit Logging  

**Sécurité à tous les niveaux** : Frontend → Microservices → Kubernetes → Pipeline CI/CD

---

**Version**: 1.0  
**Dernière mise à jour**: Décembre 2024

