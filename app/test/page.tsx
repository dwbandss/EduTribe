import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tribalImages } from '@/data/images';

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Component Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Button Component</h2>
          <Button>Test Button</Button>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Utils Function</h2>
          <div className={cn("bg-blue-500 text-white p-2 rounded")}>
            Styled with cn()
          </div>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Images Data</h2>
          <p>Total circular gallery images: {tribalImages.circularGallery.length}</p>
          <p>Total bento grid images: {Object.keys(tribalImages.bentoGrid).length}</p>
        </div>
      </div>
    </div>
  );
}
