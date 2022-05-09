package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	telemetry "github.com/bancodobrasil/gin-telemetry"
)

func main() {

	externalServiceURL := os.Getenv("EXTERNAL_SERVICE_URL")
	serviceName := os.Getenv("SERVICE_NAME")
	serverPort := os.Getenv("PORT")
	if serverPort == "" {
		serverPort = "7000"
	}

	router := gin.Default()
	router.Use(CORSMiddleware())

	router.GET("/user/:name", telemetry.Middleware(serviceName), func(c *gin.Context) {
		name := c.Param("name")
		if externalServiceURL != "" {
			ctx := c.Request.Context()
			req, err := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("%s/user/%s", externalServiceURL, name), nil)

			if err != nil {
				log.Fatal(err)
			}

			res, err := telemetry.HTTPClient.Do(req)

			if err != nil {
				log.Fatal(err)
			}

			defer res.Body.Close()

			data, err := ioutil.ReadAll(res.Body)
			if err != nil {
				log.Fatal(err)
			}
			name = string(data)
			c.String(http.StatusOK, "Response from %s: '%s'", externalServiceURL, name)
		} else {
			c.String(http.StatusOK, "Hello %s", name)
		}
	})

	router.Run(fmt.Sprintf(":%s", serverPort))
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
