// From [1]
export default function createBuffer(device: GPUDevice, data: any, usage: GPUBufferUsageFlags): GPUBuffer {
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: usage | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    const destination = new data.constructor(buffer.getMappedRange());
    destination.set(data);
    buffer.unmap();
    return buffer;
}