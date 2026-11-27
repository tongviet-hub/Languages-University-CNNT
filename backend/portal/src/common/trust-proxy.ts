/**
 * Đọc TRUST_PROXY: tin header X-Forwarded-For từ những địa chỉ nào.
 *
 *  - Để trống hoặc "false": KHÔNG tin ai (mặc định an toàn). req.ip = IP của kết nối TCP.
 *  - Danh sách IP/subnet cụ thể của proxy, cách nhau dấu phẩy. Ví dụ "172.30.0.10" (chỉ Portal)
 *    hoặc "loopback" (Nginx chạy cùng máy, proxy tới 127.0.0.1).
 *
 * Không chấp nhận "true" hay số hop: khi đó ai gọi thẳng vào dịch vụ cũng tự viết được X-Forwarded-For,
 * mỗi request giả một IP mới và vượt qua giới hạn đăng nhập. Cũng không nên dùng cả dải mạng riêng
 * (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16): máy trong LAN và gateway NAT của Docker đều nằm trong đó.
 */
export function parseTrustProxy(value: string | undefined): false | string {
  const v = value?.trim();
  if (!v || v === 'false') return false;
  if (v === 'true' || /^\d+$/.test(v)) {
    throw new Error('TRUST_PROXY phải là IP/subnet cụ thể của proxy (vd: 172.30.0.10 hoặc loopback), không dùng "true" hay số hop');
  }
  return v;
}
