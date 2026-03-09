export function CreateAccount() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "900px",
          height: "500px",
          display: "flex",
          borderRadius: "30px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "#73967f",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "32px",
                margin: "0",
              }}
            >
              welcome to
            </p>
            <h1
              style={{
                fontSize: "85px",
                margin: "0",
              }}
            >
              QURIO
            </h1>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: "#f5f5f5",
          }}
        ></div>
      </div>
    </div>
  );
}