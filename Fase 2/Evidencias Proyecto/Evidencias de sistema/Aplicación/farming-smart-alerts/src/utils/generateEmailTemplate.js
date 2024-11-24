const { DateTime } = require('luxon');

const generateEmailTemplate = alertData => {
  const formattedDate = DateTime.now().setZone('America/Santiago').toFormat('dd/MM/yyyy - HH:mm:ss');

  return `
    <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: left;">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            padding: 10px !important;
          }
          .email-container h2, .email-container h3 {
            font-size: 20px !important;
          }
          .email-container p, .email-container td {
            font-size: 16px !important;
          }
        }
      </style>
      <div class="email-container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="cid:logo" alt="Logo" style="width: 150px; margin-bottom: 20px;" />
        <h2 style="font-weight: bold; font-size: 24px;">⚠️ Alerta Gatillada</h2>
        <p style="font-size: 18px;">Alerta Gatillada: <strong>${alertData.alert_name}</strong> el ${formattedDate}</p>
        
        <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 18px;">
          <tr style="background-color: #f2f2f2;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Dispositivo Afectado</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alertData.device_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Producto Afectado</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alertData.product_name}</td>
          </tr>
        </table>

        <h3 style="font-weight: bold; font-size: 24px;">Alerta causada por:</h3>
        
        <table style="border-collapse: collapse; width: 100%; font-size: 18px;">
          <tr style="background-color: #f2f2f2;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Condición</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alertData.condition}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Métrica</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alertData.metric}</td>
          </tr>
          <tr style="background-color: #f2f2f2;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Ventana de Tiempo</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alertData.time_window}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Valor Gatillante</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alertData.triggered_threshold_value}</td>
          </tr>
          <tr style="background-color: #f2f2f2;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Operador</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alertData.operator}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Umbral</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alertData.threshold}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 20px; width: 100%;">
          <a href="${process.env.URL_FRONTEND}" 
             style="display: block; background-color: #0078D3; color: white; padding: 12px 0; text-decoration: none; font-size: 18px; border-radius: 4px; width: 100%; text-align: center;">
            Ir a Farming Smart >
          </a>
        </div>

        <div style="font-size: 18px; color: #333; margin-top: 20px; text-align: left;">
          <p><strong><em>Para evitar el spam, la próxima alerta se enviará en <span style="color: red;">${process.env.ALERT_COOLDOWN_MINUTES}</span> minutos si el problema no ha sido resuelto.</em></strong></p>
        </div>

      </div>
    </div>
  `;
};

module.exports = generateEmailTemplate;
