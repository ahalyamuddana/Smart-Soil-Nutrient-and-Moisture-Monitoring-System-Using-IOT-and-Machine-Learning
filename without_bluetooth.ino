#include <SoftwareSerial.h>
#include <ModbusMaster.h>

// RS485 for NPK
SoftwareSerial rs485(11,10);
ModbusMaster node;

#define MAX485_RE_DE 8

int soilPin = A0;

void preTransmission() {
  digitalWrite(MAX485_RE_DE, HIGH);
}

void postTransmission() {
  digitalWrite(MAX485_RE_DE, LOW);
}

void setup() {

  Serial.begin(9600);

  pinMode(MAX485_RE_DE, OUTPUT);
  digitalWrite(MAX485_RE_DE, LOW);

  rs485.begin(9600);
  node.begin(1, rs485);

  node.preTransmission(preTransmission);
  node.postTransmission(postTransmission);

}

void loop() {

  int soilValue = analogRead(soilPin);

  int N=0,P=0,K=0;

  uint8_t result = node.readHoldingRegisters(0x001E,3);

  if(result == node.ku8MBSuccess){
    N = node.getResponseBuffer(0);
    P = node.getResponseBuffer(1);
    K = node.getResponseBuffer(2);
  }

  Serial.print(N);
  Serial.print(",");
  Serial.print(P);
  Serial.print(",");
  Serial.print(K);
  Serial.print(",");
  Serial.println(soilValue);

  delay(5000);
}