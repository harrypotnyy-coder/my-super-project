package com.example.probationbackend.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/traccar")
class TraccarProxyController {

    // Простой метод для теста
    @GetMapping("/devices")
    fun getDevices(): ResponseEntity<*> {
        return ResponseEntity.ok(mapOf(
            "status" to "success",
            "message" to "Nginx + Spring Boot работают!",
            "devices" to listOf(
                mapOf("id" to 1, "name" to "Test Device 1"),
                mapOf("id" to 2, "name" to "Test Device 2")
            )
        ))
    }

    // Метод для приема GPS от мобильного приложения
    @PostMapping("/positions")
    fun receivePosition(@RequestBody positionData: Map<String, Any>): ResponseEntity<*> {
        println("Получены GPS данные: $positionData")
        return ResponseEntity.ok(mapOf(
            "status" to "received",
            "deviceId" to positionData["deviceId"],
            "timestamp" to System.currentTimeMillis()
        ))
    }
}