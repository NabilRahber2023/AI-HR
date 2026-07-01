import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.base import Base
from app.database.session import get_db

# Use SQLite for testing
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# ── AUTH TESTS ──────────────────────────────────────────────
class TestAuth:
    def test_signup_admin(self):
        res = client.post("/auth/signup", json={
            "full_name": "Test Admin",
            "email": "testadmin@test.com",
            "password": "test1234",
            "role": "admin"
        })
        assert res.status_code in (200, 400)  # 400 if already exists

    def test_signup_user(self):
        res = client.post("/auth/signup", json={
            "full_name": "Test User",
            "email": "testuser@test.com",
            "password": "test1234",
            "role": "user"
        })
        assert res.status_code in (200, 400)

    def test_login_valid(self):
        # Signup first
        client.post("/auth/signup", json={
            "full_name": "Login Test",
            "email": "logintest@test.com",
            "password": "test1234",
            "role": "admin"
        })
        res = client.post("/auth/login", json={"email": "logintest@test.com", "password": "test1234"})
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_invalid_password(self):
        res = client.post("/auth/login", json={"email": "logintest@test.com", "password": "wrongpass"})
        assert res.status_code == 401

    def test_login_nonexistent_user(self):
        res = client.post("/auth/login", json={"email": "nobody@test.com", "password": "test1234"})
        assert res.status_code == 401

    def test_me_authenticated(self):
        client.post("/auth/signup", json={
            "full_name": "Me Test",
            "email": "metest@test.com",
            "password": "test1234",
            "role": "admin"
        })
        login = client.post("/auth/login", json={"email": "metest@test.com", "password": "test1234"})
        token = login.json()["access_token"]
        res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert res.json()["email"] == "metest@test.com"

    def test_me_unauthenticated(self):
        res = client.get("/auth/me")
        assert res.status_code == 401


# ── ANALYTICS TESTS ──────────────────────────────────────────
def get_admin_token():
    client.post("/auth/signup", json={
        "full_name": "Analytics Admin",
        "email": "analyticsadmin@test.com",
        "password": "test1234",
        "role": "admin"
    })
    res = client.post("/auth/login", json={"email": "analyticsadmin@test.com", "password": "test1234"})
    return res.json().get("access_token", "")


class TestAnalytics:
    def test_summary(self):
        token = get_admin_token()
        res = client.get("/analytics/summary", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert "total_employees" in data

    def test_salary_distribution(self):
        token = get_admin_token()
        res = client.get("/analytics/salary-distribution", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_department_performance(self):
        token = get_admin_token()
        res = client.get("/analytics/department-performance", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200

    def test_ninebox_distribution(self):
        token = get_admin_token()
        res = client.get("/analytics/9box-distribution", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200

    def test_gender_distribution(self):
        token = get_admin_token()
        res = client.get("/analytics/gender-distribution", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200

    def test_analytics_requires_admin(self):
        client.post("/auth/signup", json={
            "full_name": "Regular User",
            "email": "regularuser@test.com",
            "password": "test1234",
            "role": "user"
        })
        res_login = client.post("/auth/login", json={"email": "regularuser@test.com", "password": "test1234"})
        token = res_login.json().get("access_token", "")
        res = client.get("/analytics/summary", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 403


# ── EMPLOYEE TESTS ──────────────────────────────────────────
class TestEmployees:
    def test_search_employees(self):
        token = get_admin_token()
        res = client.get("/employees/search?q=John", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_upload_invalid_csv(self):
        token = get_admin_token()
        import io
        bad_csv = b"col1,col2\nval1,val2"
        res = client.post(
            "/employees/upload-csv",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("test.csv", io.BytesIO(bad_csv), "text/csv")}
        )
        assert res.status_code == 422


# ── PREDICTION TESTS ──────────────────────────────────────────
class TestPrediction:
    def test_predict_without_model(self):
        token = get_admin_token()
        payload = {
            "age": 30, "gender": "Male", "department": "IT", "job_role": "Software Engineer",
            "years_of_experience": 5, "monthly_salary_usd": 4000,
            "avg_monthly_attendance_percent": 90, "late_arrival_count": 2,
            "absent_days_last_6_months": 1, "overtime_hours_monthly": 8,
            "kpi_score": 75, "goal_completion_percent": 80, "task_completion_rate": 78,
            "manager_feedback_score": 82, "training_hours": 40, "certifications_count": 3,
            "skill_assessment_score": 75, "leadership_assessment_score": 70
        }
        res = client.post("/prediction/custom", json=payload, headers={"Authorization": f"Bearer {token}"})
        # Either predicts (if model exists) or 503
        assert res.status_code in (200, 503)

    def test_metrics_endpoint(self):
        token = get_admin_token()
        res = client.get("/prediction/metrics", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200


# ── CHATBOT TESTS ──────────────────────────────────────────
class TestChatbot:
    def test_chat_returns_response(self):
        client.post("/auth/signup", json={
            "full_name": "Chat User",
            "email": "chatuser@test.com",
            "password": "test1234",
            "role": "user"
        })
        res_login = client.post("/auth/login", json={"email": "chatuser@test.com", "password": "test1234"})
        token = res_login.json().get("access_token", "")
        res = client.post("/chat/chat", json={"message": "How do I improve performance?"}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert "response" in res.json()
        assert len(res.json()["response"]) > 0

    def test_chat_history(self):
        client.post("/auth/signup", json={
            "full_name": "History User",
            "email": "historyuser@test.com",
            "password": "test1234",
            "role": "user"
        })
        res_login = client.post("/auth/login", json={"email": "historyuser@test.com", "password": "test1234"})
        token = res_login.json().get("access_token", "")
        client.post("/chat/chat", json={"message": "Test message"}, headers={"Authorization": f"Bearer {token}"})
        res = client.get("/chat/history", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert isinstance(res.json(), list)


# ── HEALTH CHECK ──────────────────────────────────────────
def test_root():
    res = client.get("/")
    assert res.status_code == 200

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
