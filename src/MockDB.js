// MockDB.js - API client bridging to Express Backend

import Papa from 'papaparse';

const API_BASE = 'http://localhost:5000/api';

class MockDB {
  async getReports() {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addReport(report) {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async updateReport(id, update) {
    try {
      await fetch(`${API_BASE}/reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
    } catch (e) {
      console.error(e);
    }
  }

  async getReportById(id) {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async exportToCSV() {
    const reports = await this.getReports();
    const csv = Papa.unparse(reports);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'parkwatch_reports.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

const mockDB = new MockDB();
export default mockDB;