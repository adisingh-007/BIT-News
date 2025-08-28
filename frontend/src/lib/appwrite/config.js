import { Client, Storage } from "appwrite"

export const appwriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || "demo_project",
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID || "demo_storage",
  url: import.meta.env.VITE_APPWRITE_URL || "https://cloud.appwrite.io/v1",
}

export const client = new Client()

client.setEndpoint(appwriteConfig.url)
client.setProject(appwriteConfig.projectId)

export const storage = new Storage(client)