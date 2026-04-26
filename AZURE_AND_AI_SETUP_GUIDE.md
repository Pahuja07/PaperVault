# Azure Storage and AI Integration Guide for PYP Website

## 📁 Complete Setup for File Storage & AI Predictions

This guide will help you configure Azure Blob Storage to store all PDF papers and OpenAI to analyze papers and predict important topics when users search.

## 🎯 Architecture Overview

```
┌─────────────────┐    Metadata     ┌──────────────────┐
│   PostgreSQL    │◄──────────────►│   Your Backend    │
│   (Database)    │   (IDs, info)   │   (Node.js)       │
└─────────────────┘                 └──────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                Upload / Download                        Topic Analysis / Prediction
                       ▼                                           ▼
              ┌──────────────────┐                       ┌──────────────────┐
              │  Azure Storage   │                       │      OpenAI      │
              │   (File Store)   │                       │   (AI Analysis)  │
              └──────────────────┘                       └──────────────────┘
```

**Key Points:**
- ✅ **PostgreSQL stores:** Paper metadata (title, semester, subject, year, Azure URL, and AI analysis topics).
- ✅ **Azure Blob Storage stores:** Actual PDF files.
- ✅ **OpenAI processes:** Paper titles and metadata to generate real-time study predictions.
- ✅ **Benefits:** Scalable storage, fast file retrieval, and smart study recommendations for students.

---

## 📝 Part 1: Azure Blob Storage Setup

### 1.1 Create Azure Storage Account
1. Go to **Azure Portal** (https://portal.azure.com).
2. Sign in with your Microsoft account.
3. Search for **Storage accounts** and click **+ Create**.
4. Fill in:
   - **Subscription**: Your active subscription.
   - **Resource group**: Create new (e.g., `PYP-Website-RG`).
   - **Storage account name**: Unique name (e.g., `pypwebsitefiles`).
   - **Region**: Choose the closest region.
   - **Performance**: Standard.
   - **Redundancy**: LRS (Locally-redundant storage) is usually fine.
5. Click **Review + create** then **Create**.

### 1.2 Get Connection String
1. Once deployed, go to your Storage Account.
2. In the left menu under **Security + networking**, click **Access keys**.
3. Under **key1**, click **Show** next to **Connection string** and copy it.
   - This is your `AZURE_STORAGE_CONNECTION_STRING`.

### 1.3 Create the Container
1. In the left menu under **Data storage**, click **Containers**.
2. Click **+ Container**.
3. Name it: `papers`.
4. Set **Public access level** to **Blob (anonymous read access for blobs only)**.
   - *This ensures users can download the papers via the URL.*
5. Click **Create**.

---

## 📝 Part 2: OpenAI Setup (AI Predictions)

### 2.1 Create OpenAI Account
1. Visit: https://platform.openai.com/
2. Sign up or log in.

### 2.2 Generate API Key
1. Go to the **API Keys** section in your dashboard.
2. Click **+ Create new secret key**.
3. Name it: `PYP-Website-AI`.
4. Click **Create secret key**.
5. **IMPORTANT**: Copy the key immediately → This is your `OPENAI_API_KEY`.
6. Make sure you have set up billing/credits on your OpenAI account to use the API.

---

## 📝 Part 3: Configure Backend

### 3.1 Update backend/.env

Open your `backend/.env` file and add the credentials you gathered:

```env
# Azure Storage Configuration
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=youraccount;AccountKey=yourkey;EndpointSuffix=core.windows.net"

# OpenAI Configuration
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

### 3.2 Required Packages

Your backend already has the required code. The following packages have been installed via `pnpm`:

```bash
cd backend
pnpm add @azure/storage-blob openai
```

---

## 📝 Part 4: How It Works in Your App

### 4.1 Uploading a Paper (Azure Storage)

Your backend has been updated in `paper.controller.js`. When you upload a paper through `/papers/upload`:

1. It receives the PDF file.
2. Uploads the file securely to the Azure `papers` container using `@azure/storage-blob`.
3. Gets the public URL of the uploaded Blob.
4. Stores the metadata in PostgreSQL with the Azure Blob URL.

### 4.2 Searching and AI Predictions (OpenAI)

When a user searches for papers (e.g., using filters for semester, branch, or title):

1. The backend retrieves the matching papers from the database.
2. It sends the titles of these past exam papers to OpenAI (`gpt-4-turbo-preview`).
3. OpenAI analyzes the patterns and returns a concise list of the **most important topics to study**.
4. The API returns both the list of papers and the AI's topic predictions to the frontend!

---

## 🔧 Troubleshooting

### Issue 1: "Azure Storage connection string missing"
**Solution**: Ensure you have copied the full connection string exactly from Azure and placed it in your `.env` file without any extra spaces.

### Issue 2: "Failed to upload file to Azure Storage"
**Solution**: 
- Verify that the container name is exactly `papers`.
- Check if your Azure storage account firewall allows your IP.

### Issue 3: "AI Analysis error / Rate Limit"
**Solution**: 
- Ensure your `OPENAI_API_KEY` is correct.
- Check if your OpenAI account has sufficient credits (OpenAI requires paid credits for API usage).

### Issue 4: "Papers cannot be downloaded"
**Solution**: 
- Check the Azure Container's Access Level. It must be set to **Blob (anonymous read access for blobs only)** so users can view the PDF.

---

## 🚀 Next Steps

1. ✅ Complete Azure and OpenAI setup following this guide.
2. ✅ Add the variables to your `.env` file.
3. ✅ Upload a test paper and ensure it appears in your Azure Storage container.
4. ✅ Search for papers and test if the AI successfully predicts the topics.
