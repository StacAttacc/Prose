{
  description = "Prose — internship management app (Spring Boot + React)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        jdk = pkgs.jdk21;
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            jdk
            maven
            nodejs_22
            postgresql_16
            docker-client
            docker-compose
          ];

          JAVA_HOME = jdk.home;

          shellHook = ''
            echo "Prose dev shell"
            echo "  java   $(java -version 2>&1 | head -n1 | cut -d'\"' -f2)"
            echo "  maven  $(mvn -v 2>/dev/null | head -n1 | awk '{print $3}')"
            echo "  node   $(node --version)"
            echo "  npm    $(npm --version)"
            echo ""
            echo "Database: docker compose up -d"
            echo "Backend:  ./mvnw spring-boot:run"
            echo "Frontend: cd prose-fe && npm install && npm run dev"
          '';
        };
      });
}
