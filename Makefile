.PHONY: all build build-contracts test lint deploy-testnet setup-tokens check-tokens format clean

all: build

build: build-contracts

build-contracts:
	cargo build --workspace --target wasm32v1-none --release

test:
	cargo test --workspace

lint:
	cargo clippy --workspace --all-targets -- -D warnings

deploy-testnet:
	bash scripts/deploy-testnet.sh

setup-tokens:
	bash scripts/testnet-setup-tokens.sh

check-tokens:
	node scripts/check-token-allowlist.mjs

format:
	cargo fmt --all

clean:
	cargo clean
