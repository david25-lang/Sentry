import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const comparisonRows = [
  { feature: "Purpose", yolo: "Detection", cnn: "Classification" },
  { feature: "Bounding Boxes", yolo: "Yes", cnn: "No" },
  { feature: "Speed", yolo: "Fast", cnn: "Medium" },
  { feature: "Best Use", yolo: "Locate damage", cnn: "Analyze condition" },
];

export function ComparisonTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Feature</TableHead>
          <TableHead>YOLOv8</TableHead>
          <TableHead>CNN</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparisonRows.map((row) => (
          <TableRow key={row.feature}>
            <TableCell className="text-zinc-300">{row.feature}</TableCell>
            <TableCell>{row.yolo}</TableCell>
            <TableCell>{row.cnn}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
