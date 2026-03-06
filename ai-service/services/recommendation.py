async def get_recommendations(user_id: str, interests: list, completed_courses: list) -> list:
    """Course recommendation engine."""
    # Demo recommendations based on interests
    all_courses = [
        {"id": "1", "title": "Complete React Masterclass", "category": "Web Development", "match_score": 95},
        {"id": "2", "title": "Python for Data Science", "category": "Data Science", "match_score": 88},
        {"id": "3", "title": "Cloud Architecture", "category": "Cloud Computing", "match_score": 82},
        {"id": "4", "title": "Mobile Development", "category": "Mobile Development", "match_score": 78},
        {"id": "5", "title": "Cybersecurity Bootcamp", "category": "Cybersecurity", "match_score": 75},
    ]
    
    # Filter out completed courses
    recommendations = [c for c in all_courses if c["id"] not in completed_courses]
    
    # Sort by match score
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    
    return recommendations[:5]
