package com.example.probationbackend.service

import com.example.probationbackend.model.Position
import com.example.probationbackend.repository.PositionRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class PositionService(
    private val positionRepository: PositionRepository
) {
    
    fun savePosition(position: Position): Position {
        return positionRepository.save(position)
    }
    
    fun getLatestPosition(deviceId: Long): Position? {
        return positionRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId)
    }
    
    fun getLatestPositions(deviceIds: List<Long>): List<Position> {
        return positionRepository.findLatestPositionsByDeviceIds(deviceIds)
    }
    
    fun getDeviceTrack(deviceId: Long, from: LocalDateTime, to: LocalDateTime): List<Position> {
        return positionRepository.findByDeviceIdAndTimestampBetween(deviceId, from, to)
    }
    
    // Генерация тестовых позиций для демонстрации
    fun generateDemoPositions(deviceId: Long): Position {
        // Генерируем случайные координаты вокруг центра города
        val centerLat = 55.7558
        val centerLng = 37.6173
        val lat = centerLat + (Math.random() - 0.5) * 0.1
        val lng = centerLng + (Math.random() - 0.5) * 0.1
        
        return Position(
            deviceId = deviceId,
            latitude = lat,
            longitude = lng,
            accuracy = 10.0,
            speed = (Math.random() * 80.0),
            course = Math.random() * 360.0,
            timestamp = LocalDateTime.now()
        )
    }
}