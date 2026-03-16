.PHONY: backend frontend setup

backend:
	cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm install && npm run dev

setup:
	cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm install
