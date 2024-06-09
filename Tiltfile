DEFAULT_LLAMA_LINK = "http://localhost:11434"

app_port= os.environ.get("PORT") or 3000
app_link = "http://localhost:{}".format(app_port)

llama_port = os.environ.get("LLAMA_PORT") or 11434
llama_link = "http://localhost:{}".format(llama_port)

local_resource(
  "nextjs",
  serve_cmd="npm run dev",
  links=[app_link],
  deps=[],
  readiness_probe=probe(
    initial_delay_secs=5,
    period_secs=30,
    http_get=http_get_action(port=app_port, path="/api/health"),
  ),
)
local_resource(
  "ollama_start",
  cmd="ollama run llama3",
  deps=[],
)
local_resource(
  "ollama_status",
  cmd="curl -s {}".format(llama_link),
  deps=["ollama_start"]
)