package com.example.probationbackend.controller

import com.example.probationbackend.model.Position
import com.example.probationbackend.service.PositionService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/positions")
class PositionController(
    private val positionService: PositionService
) {
    
    // Получение последних позиций всех устройств
    @GetMapping
    fun getLatestPositions(): ResponseEntity<List<Position>> {
        // В реальности здесь нужно получать deviceIds из базы
        // Пока возвращаем демо данные
        val demoPositions = listOf(
            positionService.generateDemoPositions(1),
            positionService.generateDemoPositions(2),
            positionService.generateDemoPositions(3)
        )
        demoPositions.forEach { positionService.savePosition(it) }
        
        return ResponseEntity.ok(demoPositions)
    }
    
    // Получение трека устройства за период
    @GetMapping("/{deviceId}/track")
    fun getDeviceTrack(
        @PathVariable deviceId: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) from: LocalDateTime,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) to: LocalDateTime
    ): ResponseEntity<List<Position>> {
        val track = positionService.getDeviceTrack(deviceId, from, to)
        return ResponseEntity.ok(track)
    }
    
    // Эндпоинт для мобильного приложения для отправки позиций
    @PostMapping
    fun receivePosition(@RequestBody positionRequest: PositionRequest): ResponseEntity<*> {
        return try {
            val position = Position(
                deviceId = positionRequest.deviceId,
                latitude = positionRequest.latitude,
                longitude = positionRequest.longitude,
                accuracy = positionRequest.accuracy,
                altitude = positionRequest.altitude,
                speed = positionRequest.speed,
                course = positionRequest.course,
                timestamp = positionRequest.timestamp ?: LocalDateTime.now()
            )
            val savedPosition = positionService.savePosition(position)
            ResponseEntity.ok(savedPosition)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
}

data class PositionRequest(
    val deviceId: Long,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Double? = null,
    val altitude: Double? = null,
    val speed: Double? = null,
    val course: Double? = null,
    val timestamp: LocalDateTime? = null
)