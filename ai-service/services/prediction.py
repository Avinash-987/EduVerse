async def predict_performance(student_id: str, course_id: str, current_progress: float, assignment_scores: list) -> dict:
    """Predict student performance and dropout risk."""
    # Simple heuristic-based prediction (demo)
    avg_score = sum(assignment_scores) / len(assignment_scores) if assignment_scores else 0
    
    # Performance prediction
    predicted_grade = "A" if avg_score >= 90 else "B+" if avg_score >= 80 else "B" if avg_score >= 70 else "C+" if avg_score >= 60 else "C"
    
    # Dropout risk calculation
    risk_factors = 0
    if current_progress < 20: risk_factors += 2
    elif current_progress < 40: risk_factors += 1
    if avg_score < 60: risk_factors += 2
    elif avg_score < 70: risk_factors += 1
    if len(assignment_scores) < 2: risk_factors += 1
    
    dropout_risk = min(risk_factors / 5.0, 1.0)
    risk_level = "high" if dropout_risk > 0.6 else "medium" if dropout_risk > 0.3 else "low"
    
    return {
        "predicted_grade": predicted_grade,
        "predicted_score": round(avg_score * 0.85 + current_progress * 0.15, 1),
        "dropout_risk": round(dropout_risk * 100, 1),
        "risk_level": risk_level,
        "recommendations": [
            "Complete more practice exercises" if avg_score < 80 else "Great job, keep it up!",
            "Engage with the AI tutor for difficult concepts" if avg_score < 70 else "Consider mentoring other students",
        ],
    }
