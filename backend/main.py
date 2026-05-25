from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import calls, tickets

load_dotenv()

app = FastAPI(title="ARIA Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calls.router, prefix="/api/calls", tags=["calls"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])

@app.get("/")
def root():
    return {"status": "ARIA Backend Online", "version": "1.0.0"}