import React, { useState, useEffect, useRef } from "react";

// ==========================================
// 4. モックモード設定
// ==========================================
const useMock = false;

// ==========================================
// 4. スタイリング仕様 (マクドナルド風・大きめUI)
// ==========================================
const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    backgroundColor: "#F4F4F4",
    minHeight: "100vh",
    padding: "20px",
    boxSizing: "border-box",
    color: "#333",
  },
  header: {
    backgroundColor: "#DA291C", // マクドナルド赤
    color: "#FFC72C", // マクドナルド黄
    textAlign: "center",
    padding: "20px 10px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "bold",
  },
  subtitle: {
    margin: "5px 0 0 0",
    fontSize: "18px",
    color: "#FFF",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    margin: "40px auto",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "18px",
    borderRadius: "6px",
    border: "2px solid #CCC",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    backgroundColor: "#FFC72C", // 黄色ベース
    color: "#202124",
    border: "none",
    padding: "15px",
    fontSize: "20px",
    fontWeight: "bold",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "0.2s",
  },
  kitchenGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    padding: "10px",
  },
  orderCard: {
    backgroundColor: "#FFF",
    border: "3px solid #DA291C",
    borderRadius: "12px",
    width: "280px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  orderHeader: {
    backgroundColor: "#DA291C",
    color: "#FFF",
    padding: "12px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "bold",
  },
  orderBody: {
    padding: "15px",
    flexGrow: 1,
    backgroundColor: "#FFF",
  },
  itemList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  itemRow: {
    fontSize: "20px",
    fontWeight: "bold",
    padding: "8px 0",
    borderBottom: "1px dashed #DDD",
    display: "flex",
    justifyContent: "space-between",
  },
  kitchenButton: {
    backgroundColor: "#FFC72C",
    color: "#202124",
    border: "none",
    padding: "15px",
    fontSize: "18px",
    fontWeight: "bold",
    width: "100%",
    cursor: "pointer",
    borderTop: "2px solid #FFC72C",
  },
  loading: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "40px 0",
    color: "#666",
  },
  errorText: {
    color: "#DA291C",
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "20px 0",
  },
  infoText: {
    textAlign: "center",
    fontSize: "18px",
    marginBottom: "20px",
  },
};

// ==========================================
// モック用ダミーデータ群
// ==========================================
let mockOrders = [
  {
    orderNo: "0609-001",
    items: [
      { menuName: "侍マック", quantity: 2 },
      { menuName: "マックフライポテトL", quantity: 1 }
    ]
  },
  {
    orderNo: "0609-002",
    items: [
      { menuName: "てりやきマックバーガー", quantity: 1 },
      { menuName: "コカ・コーラM", quantity: 1 }
    ]
  },
  {
    orderNo: "0609-003",
    items: [
      { menuName: "ハッピーセット", quantity: 1 }
    ]
  }
];

export default function McdKitchenFront() {
  // 状態構成: (0)初期設定: "CONFIG", (1)厨房表示: "KITCHEN", (2)エラー: "ERROR"
  const [screenMode, setScreenMode] = useState("CONFIG");
  const [serverUrl, setServerUrl] = useState("");
  const [terminalNo, setTerminalNo] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 自動更新のためのインターバルID保持
  const intervalRef = useRef(null);

  // 画面切り替え時の要件：window.scrollTo(0, 0)
  const changeScreen = (mode) => {
    setScreenMode(mode);
    window.scrollTo(0, 0);
  };

  // URL末尾のスラッシュをクリアする関数
  const cleanUrl = (url) => {
    return url.trim().replace(/\/+$/, "");
  };

  // 50秒ごとの自動更新の設定・クリーンアップ
  useEffect(() => {
    if (screenMode === "KITCHEN") {
      intervalRef.current = setInterval(() => {
        fetchKitchenData();
      }, 50000); // 50秒
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [screenMode]);

  // 初期ロード時にlocalStorageから設定を読み込む
  useEffect(() => {
    const savedUrl = localStorage.getItem("serverUrl") || "";
    const savedTerminal = localStorage.getItem("terminalNo") || "";
    setServerUrl(savedUrl);
    setTerminalNo(savedTerminal);
  }, []);

  // 設定保存処理
  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!serverUrl.trim() || !terminalNo.trim()) {
      alert("すべての項目を入力してください。");
      return;
    }

    const cleanedUrl = cleanUrl(serverUrl);
    localStorage.setItem("serverUrl", cleanedUrl);
    localStorage.setItem("terminalNo", terminalNo.trim());
    setServerUrl(cleanedUrl);

    // 厨房データ取得へ移行
    fetchKitchenData(cleanedUrl, terminalNo.trim());
  };

  // 厨房データ一覧取得 (orderNo未指定)
  const fetchKitchenData = async (targetUrl = serverUrl, targetTerminal = terminalNo) => {
    setIsLoading(true);
    setErrorMessage("");

    const requestPayload = {
      terminalNo: targetTerminal,
      messageType: "KITCHEN_REQUEST"
    };

    if (useMock) {
      // モックモード動作
      console.log("--- [Mock Mode] 厨房データ取得 ---");
      console.log(`送信先URL: ${targetUrl}/api/kitchen`);
      console.log("HTTPメソッド: POST");
      console.log("送信JSON:\n", JSON.stringify(requestPayload, null, 2));
      
      setTimeout(() => {
        setOrders([...mockOrders]);
        setIsLoading(false);
        changeScreen("KITCHEN");
      }, 400);
    } else {
      // 本番 fetch 通信
      try {
        const response = await fetch(`${targetUrl}/api/kitchen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
          throw new Error(`サーバーエラーが発生しました (Status: ${response.status})`);
        }

        const data = await response.json();
        if (data.result === "OK") {
          setOrders(data.orders || []);
          setIsLoading(false);
          changeScreen("KITCHEN");
        } else {
          throw new Error(data.message || "データ取得に失敗しました。");
        }
      } catch (err) {
        setIsLoading(false);
        setErrorMessage(err.message);
        changeScreen("ERROR");
      }
    }
  };

  // 調理済ボタン押下処理 (orderNo指定)
  const handleCompleteOrder = async (orderNo) => {
    setIsLoading(true);
    setErrorMessage("");

    const requestPayload = {
      messageType: "KITCHEN_REQUEST",
      orderNo: orderNo
    };

    if (useMock) {
      // モックモード動作
      console.log(`--- [Mock Mode] 調理完了処理 (注文番号: ${orderNo}) ---`);
      console.log(`送信先URL: ${serverUrl}/api/kitchen`);
      console.log("HTTPメソッド: POST");
      console.log("送信JSON:\n", JSON.stringify(requestPayload, null, 2));

      setTimeout(() => {
        // 該当の注文データを配列から除外（疑似処理）
        mockOrders = mockOrders.filter(o => o.orderNo !== orderNo);
        setOrders([...mockOrders]);
        setIsLoading(false);
      }, 400);
    } else {
      // 本番 fetch 通信
      try {
        const response = await fetch(`${serverUrl}/api/kitchen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
          throw new Error(`状態更新に失敗しました (Status: ${response.status})`);
        }

        const data = await response.json();
        if (data.result === "OK") {
          setOrders(data.orders || []);
          setIsLoading(false);
        } else {
          throw new Error(data.message || "更新レスポンスが正しくありません。");
        }
      } catch (err) {
        setIsLoading(false);
        setErrorMessage(err.message);
        changeScreen("ERROR");
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* 共通ヘッダー */}
      <header style={styles.header}>
        <h1 style={styles.title}>厨房システム</h1>
        {screenMode === "KITCHEN" && (
          <p style={styles.subtitle}>端末番号: {terminalNo} | 接続先: {serverUrl}</p>
        )}
      </header>

      {/* 通信中のローディング表示 */}
      {isLoading && <div style={styles.loading}>読み込み中...</div>}

      {/* (0) 初期設定画面 */}
      {screenMode === "CONFIG" && !isLoading && (
        <div style={styles.card}>
          <form onSubmit={handleSaveConfig}>
            <div style={styles.formGroup}>
              <label style={styles.label}>バックエンド接続先URL:</label>
              <input
                type="text"
                style={styles.input}
                placeholder="http://12.34.56.78:8080"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>厨房端末番号:</label>
              <input
                type="text"
                style={styles.input}
                placeholder="KITCHEN-01"
                value={terminalNo}
                onChange={(e) => setTerminalNo(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={styles.button}>設定を保存して接続</button>
          </form>
        </div>
      )}

      {/* (1) 厨房表示画面 */}
      {screenMode === "KITCHEN" && !isLoading && (
        <div>
          <p style={styles.infoText}>※50秒ごとに自動更新されます。未調理のオーダーを処理してください。</p>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", fontSize: "22px", marginTop: "5px", color: "#666" }}>
              現在、未調理のオーダーはありません。
            </div>
          ) : (
            <div style={styles.kitchenGrid}>
              {orders.map((order) => (
                <div key={order.orderNo} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    注文番号: {order.orderNo}
                  </div>
                  <div style={styles.orderBody}>
                    <ul style={styles.itemList}>
                      {order.items.map((item, idx) => (
                        <li key={idx} style={styles.itemRow}>
                          <span>{item.menuName}</span>
                          <span>{item.quantity} 個</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    style={styles.kitchenButton}
                    onClick={() => handleCompleteOrder(order.orderNo)}
                  >
                    調理済
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ maxWidth: "200px", margin: "40px auto" }}>
            <button
              style={{ ...styles.button, backgroundColor: "#666", color: "#FFF" }}
              onClick={() => changeScreen("CONFIG")}
            >
              設定へ戻る
            </button>
          </div>
        </div>
      )}

      {/* (2) エラー画面 */}
      {screenMode === "ERROR" && !isLoading && (
        <div style={styles.card}>
          <div style={styles.errorText}>エラーが発生しました</div>
          <p style={{ textAlign: "center", fontSize: "16px" }}>{errorMessage}</p>
          <button
            style={styles.button}
            onClick={() => changeScreen("CONFIG")}
          >
            設定画面へ戻る
          </button>
        </div>
      )}
    </div>
  );
}