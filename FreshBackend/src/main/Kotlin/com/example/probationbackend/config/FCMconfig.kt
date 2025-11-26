package com.example.probationbackend.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import java.io.IOException

@Configuration
class FcmConfig(
    @Value("\${firebase.service-account-file-path:#{null}}") private val serviceAccountPath: String?,
) {

    @Bean
    fun firebaseApp(): FirebaseApp? {
        if (serviceAccountPath.isNullOrBlank()) {
            println("Firebase service account path is not configured. FCM will not work.")
            return null
        }

        val resource = ClassPathResource(serviceAccountPath)
        if (!resource.exists()) {
            println("Firebase service account file not found at path: $serviceAccountPath. FCM will not work.")
            return null
        }

        return try {
            val serviceAccount = resource.inputStream
            val options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build()
            FirebaseApp.initializeApp(options)
        } catch (e: IOException) {
            println("Failed to initialize Firebase Admin SDK: ${e.message}")
            e.printStackTrace()
            null
        }
    }
}
