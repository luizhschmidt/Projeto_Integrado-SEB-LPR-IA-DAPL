using System;
using System.IO.Ports;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program 
{
    static async Task Main(string[] args) 
    {
        string portaCom = "COM5"; // Ajuste conforme a porta no seu computador
        using SerialPort sp = new SerialPort(portaCom, 115200);
        using HttpClient client = new HttpClient();
        
        // Timeout tolerante para evitar cancelamento prematuro
        client.Timeout = TimeSpan.FromSeconds(2);

        try 
        {
            sp.Open();
            sp.DiscardInBuffer();
            Console.WriteLine($"[C#] Conectado na {portaCom}. Aguardando dados em tempo real...");

            while (true) 
            {
                // Se houver mais de uma linha acumulada no buffer, descarta as antigas
                while (sp.BytesToRead > 32) 
                {
                    sp.ReadLine(); 
                }

                // Lê a linha mais recente enviada pelo STM32
                string linhaHex = sp.ReadLine().Trim();

                if (!string.IsNullOrEmpty(linhaHex) && linhaHex.Length <= 4) 
                {
                    try 
                    {
                        // Converte a string Hexadecimal (Base 16) para Inteiro Decimal (Base 10)
                        int valorSensor = Convert.ToInt32(linhaHex, 16);

                        // Monta o payload JSON
                        var jsonBody = JsonSerializer.Serialize(new { value = valorSensor });
                        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                        // Envia para o backend Node.js
                        HttpResponseMessage resp = await client.PostAsync("http://localhost:3000/api/readings", content);
                        Console.WriteLine($"[C#] HEX: {linhaHex,-4} | Decimal: {valorSensor,-4} | HTTP: {resp.StatusCode}");
                    }
                    catch (FormatException) 
                    {
                        // Ignora eventuais bytes corrompidos de início de transmissão
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Aviso HTTP]: {ex.Message}");
                    }
                }
            }
        } 
        catch (Exception ex) 
        {
            Console.WriteLine($"[Erro Fatal]: {ex.Message}");
        }
    }
}