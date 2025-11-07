package com.example.probationbackend.repository

import com.example.probationbackend.model.Position
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface PositionRepository : JpaRepository<Position, Long> {
    
    fun findTopByDeviceIdOrderByTimestampDesc(deviceId: Long): Position?
    
    fun findByDeviceIdAndTimestampBetween(
        deviceId: Long, 
        start: LocalDateTime, 
        end: LocalDateTime
    ): List<Position>
    
    @Query("SELECT p FROM Position p WHERE p.deviceId IN :deviceIds AND p.timestamp = (SELECT MAX(p2.timestamp) FROM Position p2 WHERE p2.deviceId = p.deviceId)")
    fun findLatestPositionsByDeviceIds(@Param("deviceIds") deviceIds: List<Long>): List<Position>
}