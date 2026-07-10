import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAXbd7FOdlPe-44Q6ZPv40OfHX_dl2cEHo",
  authDomain:        "monitoring-pompa-8323c.firebaseapp.com",
  databaseURL:       "https://monitoring-pompa-8323c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "monitoring-pompa-8323c",
  storageBucket:     "monitoring-pompa-8323c.firebasestorage.app",
  messagingSenderId: "1073774800980",
  appId:             "1:1073774800980:web:7a87548689455dd8ec3dc1"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

export function startFirebaseListener(onDataReceived) {
  const sensorRef = ref(db, 'sensor');

  onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      console.warn("Firebase: data kosong");
      return;
    }

    console.log("Data Firebase diterima:", data); // untuk debug

    onDataReceived({
      v:     data.tegangan  ?? 0,
      a:     data.arus      ?? 0,
      p:     data.daya      ?? 0,
      pct:   data.dod_pct   ?? 0,
      valve: [
        data.valve1 ?? false,
        data.valve2 ?? false
      ]
    });
  }, (error) => {
    console.error("Firebase error:", error);
  });
}